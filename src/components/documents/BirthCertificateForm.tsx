
import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, FileText, LoaderCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { documentRequirements } from '@/data/services';
import DocumentUploader from './DocumentUploader';
import { UserContext } from '@/App';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  childName: z.string().min(2, { message: "Child's name is required" }),
  fatherName: z.string().min(2, { message: "Father's name is required" }),
  motherName: z.string().min(2, { message: "Mother's name is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  placeOfBirth: z.string().min(2, { message: "Place of birth is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  purpose: z.string().min(5, { message: "Purpose is required" }),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const BirthCertificateForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { user, isAuthenticated } = useContext(UserContext);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: "",
      fatherName: "",
      motherName: "",
      placeOfBirth: "",
      address: "",
      // purpose: "",
      additionalNotes: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to submit a request");
      navigate('/login');
      return;
    }

    if (attachments.length === 0) {
      toast.error("Please upload required documents");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For real file uploads, we would first upload the files to storage
      // and get back URLs/file paths, then store those in the database
      // For this demo, we'll just store placeholder URLs
      
      const attachmentPaths = attachments.map(file => `birth_cert_${file.name}`);
      
      // Create additional details JSON for the specific form fields
      const formDetails = {
        childName: data.childName,
        fatherName: data.fatherName,
        motherName: data.motherName,
        dateOfBirth: data.dateOfBirth,
        placeOfBirth: data.placeOfBirth,
        address: data.address
      };
      
      // Insert the document request into the database
      const { data: documentData, error } = await supabase
        .from('document_requests')
        .insert({
          user_id: user.id,
          document_type: 'birth',
          purpose: data.purpose,
          status: 'pending',
          attachments: attachmentPaths,
          additional_notes: data.additionalNotes ? data.additionalNotes : null,
          form_details: formDetails // Store form-specific details
        })
        .select();
      
      if (error) throw error;
      
      toast.success("Birth certificate request submitted successfully");
      
      // Now navigate to the track page with the new document request ID
      if (documentData && documentData[0]) {
        navigate(`/track?type=document&id=${documentData[0].id}`);
      } else {
        // Reset the form if not navigating away
        form.reset();
        setAttachments([]);
      }
    } catch (error) {
      console.error('Error submitting document request:', error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="mb-4">You need to log in to request a birth certificate.</p>
          <Button onClick={() => navigate('/login')}>Login Now</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-gov-blue-800">
          <FileText className="mr-2 h-5 w-5" />
          Birth Certificate Request
        </CardTitle>
        <CardDescription>
          Fill out the form to request a birth certificate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="childName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's Full Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter child's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date of birth</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother's Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mother's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="placeOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Birth <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter place of birth (Hospital/Home/etc.)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter permanent address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Certificate <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explain why you need this certificate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             */}
            <div className="space-y-2">
              <Label>Required Documents <span className="text-red-500">*</span></Label>
              <div className="bg-gov-blue-50 rounded-lg p-4 border border-gov-blue-100 mb-4">
                <ul className="list-disc pl-5 space-y-1">
                  {documentRequirements.birth.map((requirement, index) => (
                    <li key={index} className="text-sm text-gov-blue-700">
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
              
              <DocumentUploader 
                attachments={attachments}
                setAttachments={setAttachments}
              />
            </div>
            
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional information" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-gov-blue-600 hover:bg-gov-blue-700 text-white transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t px-6 py-3">
        <p className="text-xs text-gray-500">
          Note: Processing of birth certificate applications typically takes 7-10 working days. You will receive updates on your application status.
        </p>
      </CardFooter>
    </Card>
  );
};

export default BirthCertificateForm;
