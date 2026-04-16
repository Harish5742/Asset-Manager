import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Sprout, MapPin, Droplets, FlaskConical, Loader2, Navigation, Thermometer, Wind, CheckCircle2 } from "lucide-react";

import { useAnalyzeSoil } from "@workspace/api-client-react";
import { useResultStore } from "@/hooks/use-result-store";
import { useLanguage, getLanguageFromLocation } from "@/hooks/use-language";
import { useGeolocation } from "@/hooks/use-geolocation";

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
import { Badge } from "@/components/ui/badge";

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
  const { t } = useLanguage();
  const geo = useGeolocation();

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

  const watchedLocation = useWatch({ control: form.control, name: "location" });
  const locationLang = geo.data?.state
    ? getLanguageFromLocation(geo.data.state)
    : getLanguageFromLocation(watchedLocation ?? "");

  const LANG_DISPLAY: Record<string, string> = {
    ta: "Tamil · தமிழ்",
    hi: "Hindi · हिंदी",
    te: "Telugu · తెలుగు",
    kn: "Kannada · ಕನ್ನಡ",
    ml: "Malayalam · മലയാളം",
    bn: "Bengali · বাংলা",
    mr: "Marathi · मराठी",
    gu: "Gujarati · ગુજરાતી",
    pa: "Punjabi · ਪੰਜਾਬੀ",
    or: "Odia · ଓଡ଼ିଆ",
    en: "English",
  };

  async function handleDetectLocation() {
    const data = await geo.detect();
    if (data) {
      form.setValue("location", data.locationName, { shouldValidate: true });
    }
  }

  function onSubmit(values: FormValues) {
    const locationLang = geo.data?.state
      ? getLanguageFromLocation(geo.data.state)
      : getLanguageFromLocation(values.location);

    analyzeSoil.mutate(
      {
        data: {
          ...values,
          language: locationLang,
          latitude: geo.data?.latitude ?? undefined,
          longitude: geo.data?.longitude ?? undefined,
          temperature: geo.data?.temperature ?? undefined,
          humidity: geo.data?.humidity ?? undefined,
        },
      },
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
          {t.formTitle}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t.formSubtitle}
        </p>
      </div>

      {/* Weather Card — shows once GPS succeeds and weather loads */}
      {geo.status === "success" && geo.data && (
        <Card className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm">
          <CardContent className="py-4 px-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Navigation className="h-4 w-4 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{t.weatherTitle}</p>
                  <p className="text-xs text-blue-600">{t.weatherGpsNote}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {geo.data.temperature != null && (
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t.weatherTemp}</p>
                      <p className="text-sm font-bold text-foreground">{geo.data.temperature.toFixed(1)}°C</p>
                    </div>
                  </div>
                )}
                {geo.data.humidity != null && (
                  <div className="flex items-center gap-1.5">
                    <Wind className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t.weatherHumidity}</p>
                      <p className="text-sm font-bold text-foreground">{geo.data.humidity}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {geo.status === "error" && geo.error && (
        <div className="mb-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
          {t.gpsError}: {geo.error}
        </div>
      )}

      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="bg-muted/30 pb-6">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            {t.sectionSampleInfo}
          </CardTitle>
          <CardDescription>
            {t.sectionSampleInfoDesc}
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
                      <FormLabel>{t.labelFarmerName}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.placeholderFarmerName} {...field} />
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
                      <FormLabel>{t.labelLocation}</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder={t.placeholderLocation} {...field} />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8 border-dashed"
                            onClick={handleDetectLocation}
                            disabled={geo.status === "detecting"}
                          >
                            {geo.status === "detecting" ? (
                              <>
                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                {t.btnDetecting}
                              </>
                            ) : geo.status === "success" ? (
                              <>
                                <CheckCircle2 className="mr-1.5 h-3 w-3 text-primary" />
                                {t.gpsLocationDetected}
                              </>
                            ) : (
                              <>
                                <Navigation className="mr-1.5 h-3 w-3" />
                                {t.btnDetectLocation}
                              </>
                            )}
                          </Button>
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
                      <FormLabel>{t.labelSeason}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectSeason} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kharif">{t.seasonKharif}</SelectItem>
                          <SelectItem value="Rabi">{t.seasonRabi}</SelectItem>
                          <SelectItem value="Summer">{t.seasonSummer}</SelectItem>
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
                      <FormLabel>{t.labelWater}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectWater} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">{t.waterLow}</SelectItem>
                          <SelectItem value="Medium">{t.waterMedium}</SelectItem>
                          <SelectItem value="High">{t.waterHigh}</SelectItem>
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
                  {t.sectionSoilReadings}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="ph"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.labelPh}</FormLabel>
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
                        <FormLabel>{t.labelNitrogen}</FormLabel>
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
                        <FormLabel>{t.labelPhosphorus}</FormLabel>
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
                        <FormLabel>{t.labelPotassium}</FormLabel>
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
                        <FormLabel>{t.labelMoisture}</FormLabel>
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
                      <FormLabel>{t.labelPreferredCrop}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.placeholderCrop} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t.preferredCropHint}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                {locationLang !== "en" && (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-primary/30 bg-primary/5 text-primary">
                    📍 {t.detectedLanguage}: {LANG_DISPLAY[locationLang] ?? locationLang.toUpperCase()}
                  </Badge>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto md:ml-auto text-base font-semibold"
                  disabled={analyzeSoil.isPending}
                >
                  {analyzeSoil.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t.btnAnalyzing}
                    </>
                  ) : (
                    t.btnGetRecommendations
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
