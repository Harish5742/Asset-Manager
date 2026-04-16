import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Sprout, MapPin, Droplets, FlaskConical, Loader2 } from "lucide-react";

import { useAnalyzeSoil } from "@workspace/api-client-react";
import { useResultStore } from "@/hooks/use-result-store";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  farmerName: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  season: z.enum(["Kharif", "Rabi", "Summer"], {
    required_error: "Please select a season",
  }),
  waterAvailability: z.enum(["Low", "Medium", "High"], {
    required_error: "Please select water availability",
  }),
  ph: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "pH must be at least 0")
    .max(14, "pH cannot exceed 14"),
  nitrogen: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(500, "Unusually high value"),
  phosphorus: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(500, "Unusually high value"),
  potassium: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(500, "Unusually high value"),
  moisture: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(100, "Percentage cannot exceed 100"),
  preferredCrop: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [, setLocation] = useLocation();
  const { setResult } = useResultStore();
  const analyzeSoil = useAnalyzeSoil();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmerName: "",
      location: "",
      season: undefined,
      waterAvailability: undefined,
      ph: 7.0,
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      moisture: 0,
      preferredCrop: "",
    },
  });

  function onSubmit(values: FormValues) {
    analyzeSoil.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setResult(data);
          setLocation("/results");
        },
      }
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
          Soil Health Analysis
        </h1>
        <p className="text-muted-foreground text-lg">
          Enter your soil test details to get personalized crop recommendations and fertilizer advice.
        </p>
      </div>

      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="bg-muted/30 pb-6">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            Sample Information
          </CardTitle>
          <CardDescription>
            Provide basic details about your farm and the soil sample.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* SECTION: Farm Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="farmerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farmer Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ramesh Kumar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District / Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="e.g. Pune, Maharashtra" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growing Season</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Season" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kharif">Kharif (Monsoon)</SelectItem>
                          <SelectItem value="Rabi">Rabi (Winter)</SelectItem>
                          <SelectItem value="Summer">Summer (Zaid)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="waterAvailability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water Availability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low (Rainfed only)</SelectItem>
                          <SelectItem value="Medium">Medium (Partial irrigation)</SelectItem>
                          <SelectItem value="High">High (Full irrigation)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* SECTION: Soil Nutrients */}
              <div>
                <div className="mb-4 flex items-center gap-2 text-lg font-medium text-foreground">
                  <FlaskConical className="h-5 w-5 text-secondary" />
                  Soil Test Readings
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="ph"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>pH Level (0-14)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nitrogen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nitrogen (N) kg/ha</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phosphorus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phosphorus (P) kg/ha</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="potassium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potassium (K) kg/ha</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moisture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moisture Content (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Droplets className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" type="number" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* SECTION: Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="preferredCrop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Crop (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Wheat, Rice, Cotton" {...field} />
                      </FormControl>
                      <FormDescription>
                        If you already have a crop in mind, tell us so we can tailor advice.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto text-base font-semibold"
                  disabled={analyzeSoil.isPending}
                >
                  {analyzeSoil.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Sample...
                    </>
                  ) : (
                    "Get Recommendations"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
