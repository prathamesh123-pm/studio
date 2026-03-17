"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useSurveyStore, SurveyRecord } from "@/lib/survey-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, Search, Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SurveysList() {
  const { getSurveys } = useSurveyStore();
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSurveys(getSurveys());
  }, []);

  const filteredSurveys = surveys.filter(s => 
    s.surveyorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.data.dairyName || s.data.farmerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary">माझी सर्वेक्षणे (My Surveys)</h1>
            <p className="text-muted-foreground">तुमच्याद्वारे पूर्ण केलेल्या सर्वेक्षणांची यादी.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="शोध (नाव, केंद्र...)" 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {filteredSurveys.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">अद्याप कोणतेही सर्वेक्षण उपलब्ध नाही.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSurveys.map((survey) => (
              <Card key={survey.id} className="bg-white hover:shadow-md transition-all border-primary/10">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex gap-4 items-center">
                    <div className={`p-3 rounded-full ${survey.type === 'dairy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                      {survey.type === 'dairy' ? <FileText className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {survey.data.dairyName || survey.data.farmerName}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {survey.data.district}, {survey.data.taluka}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
                        <span>ID: {survey.surveyorId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={survey.type === 'dairy' ? 'default' : 'secondary'} className={survey.type === 'dairy' ? 'bg-primary' : 'bg-accent'}>
                      {survey.type === 'dairy' ? 'डेअरी सर्वेक्षण' : 'शेतकरी रिव्ह्यू'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                      <Printer className="h-4 w-4" /> रिपोर्ट
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .card-content-print {
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
