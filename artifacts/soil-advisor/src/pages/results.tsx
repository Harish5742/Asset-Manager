import { Redirect, Link } from "wouter";
import { 
  Sprout, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  Languages,
  ThermometerSun,
  TestTube2
} from "lucide-react";
import { useResultStore } from "@/hooks/use-result-store";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function Results() {
  const { result } = useResultStore();
  const { t } = useLanguage();

  if (!result) {
    return <Redirect to="/" />;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-primary";
    if (score >= 50) return "bg-secondary";
    return "bg-destructive";
  };

  const getScoreTextClass = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 50) return "text-secondary";
    return "text-destructive";
  };

  const localLangLabel = (result as { languageName?: string }).languageName
    ?? t.resultsEnglishLabel;

  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">{t.resultsTitle}</h1>
          <p className="text-muted-foreground mt-1">
            {t.resultsGeneratedOn} {new Date(result.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="shrink-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.btnAnalyzeAnother}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recommended Crops */}
        <Card className="lg:col-span-2 border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5 pb-4 border-b">
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <Sprout className="h-6 w-6" />
              {t.resultsCropsTitle}
            </CardTitle>
            <CardDescription>
              {t.resultsCropsDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {result.crops.map((crop, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row gap-6">
                  <div className="sm:w-1/3 flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">{crop.name}</h3>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-black tracking-tighter">
                        <span className={getScoreTextClass(crop.score)}>{crop.score}</span>
                        <span className="text-lg text-muted-foreground font-medium">/100</span>
                      </div>
                    </div>
                    <Progress 
                      value={crop.score} 
                      className="h-2 mt-3" 
                      indicatorClassName={getScoreColor(crop.score)} 
                    />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
                      {t.resultsSuitabilityScore}
                    </span>
                  </div>
                  <div className="sm:w-2/3 sm:border-l sm:pl-6 flex items-center">
                    <p className="text-muted-foreground leading-relaxed">
                      {crop.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats / Corrections */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-secondary/20">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-secondary">
                <AlertCircle className="h-5 w-5" />
                {t.resultsSoilCorrections}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {result.soilCorrections.length > 0 ? (
                <ul className="space-y-4">
                  {result.soilCorrections.map((corr, idx) => (
                    <li key={idx} className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
                      <div className="font-bold text-foreground mb-1">{corr.amendment}</div>
                      <div className="text-sm font-medium text-secondary mb-2">{t.resultsDosage}: {corr.dosage}</div>
                      <p className="text-sm text-muted-foreground">{corr.reason}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="h-10 w-10 text-primary mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">{t.resultsNoCorrections}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fertilizers section */}
      <Card className="mb-8 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TestTube2 className="h-5 w-5 text-accent-foreground" />
            {t.resultsFertilizerPlan}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.fertilizers.map((fert, idx) => (
              <div key={idx} className="border rounded-xl p-5 hover:border-primary/50 transition-colors">
                <h4 className="font-bold text-lg mb-3 text-foreground">{fert.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground font-medium uppercase block">{t.resultsDosage}</span>
                      <span className="text-sm font-medium">{fert.dosage}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ThermometerSun className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground font-medium uppercase block">{t.resultsTiming}</span>
                      <span className="text-sm font-medium">{fert.timing}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dual Language Explanations */}
      <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Languages className="h-5 w-5 text-primary" />
            {t.resultsExplanationTitle}
          </CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* English Side */}
          <div className="p-6 md:p-8 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-muted px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">{t.resultsEnglishLabel}</div>
            </div>
            <div className="prose prose-slate max-w-none text-muted-foreground">
              {result.explanationEnglish.split('\n').map((paragraph, i) => (
                <p key={i} className="leading-relaxed mb-4">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Local Language Side */}
          <div className="p-6 md:p-8 bg-[#fdfaf6]">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider">{localLangLabel}</div>
            </div>
            <div className="prose prose-slate max-w-none text-foreground font-medium">
              {result.explanationTamil.split('\n').map((paragraph, i) => (
                <p key={i} className="leading-[1.8] mb-4 text-[1.05rem]">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Separator className="my-6" />

      <div className="flex justify-center">
        <Link href="/">
          <Button size="lg" className="font-semibold">
            <ArrowLeft className="mr-2 h-5 w-5" />
            {t.btnAnalyzeAnother}
          </Button>
        </Link>
      </div>
    </div>
  );
}
