
"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useSurveyStore, SurveyRecord } from "@/lib/survey-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  FileText, 
  Search, 
  Clock, 
  MapPin, 
  ClipboardList, 
  LayoutDashboard,
  Eye,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

export default function SurveysList() {
  const { getSurveys, deleteSurvey } = useSurveyStore();
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadSurveys = () => {
    const allSurveys = getSurveys().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setSurveys(allSurveys);
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("तुम्हाला खात्री आहे की तुम्ही हा रिपोर्ट हटवू इच्छिता?")) {
      deleteSurvey(id);
      loadSurveys();
      toast({ title: "यशस्वी", description: "रिपोर्ट हटवण्यात आला आहे." });
    }
  };

  const filterSurveys = (type?: 'dairy' | 'farmer') => {
    return surveys.filter(s => {
      const matchesType = type ? s.type === type : true;
      const matchesSearch = 
        (s.surveyorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.data.dairyName || s.data.farmerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  };

  const DataRow = ({ label, value }: { label: string, value: any }) => {
    if (value === undefined || value === null || value === "") return null;
    let displayValue = value;
    
    if (value === 'Yes') displayValue = 'होय';
    if (value === 'No') displayValue = 'नाही';
    if (value === 'ReadyMade') displayValue = 'रेडीमेड कॅटल फीड';
    if (value === 'HomeMade') displayValue = 'घरगुती मिश्रण';
    if (value === 'Both') displayValue = 'दोनों (रेडीमेड व घरगुती)';

    return (
      <TableRow>
        <TableHead className="w-1/2 font-bold bg-muted/20 py-2 text-xs md:text-sm">{label}</TableHead>
        <TableCell className="py-2 text-xs md:text-sm">
          {Array.isArray(displayValue) ? (
            <div className="flex flex-wrap gap-1">
              {displayValue.map((v, i) => <Badge key={i} variant="outline" className="text-[10px]">{v}</Badge>)}
            </div>
          ) : (
            String(displayValue)
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-6 py-4">
        {/* १. सामान्य माहिती */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>१. सामान्य माहिती</h4>
          <Table>
            <TableBody>
              <DataRow label={isDairy ? "मिल्किंग सेंटर / डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव" : "मोबाईल नंबर"} value={isDairy ? d.ownerName : d.mobile} />
              {isDairy && <DataRow label="संपर्क क्रमांक" value={d.contact} />}
              <DataRow label="गाव (Village)" value={d.village} />
              <DataRow label="तालुका (Taluka)" value={d.taluka} />
              <DataRow label="जिल्हा (District)" value={d.district} />
              {isDairy && <DataRow label="संपूर्ण पत्ता" value={d.address} />}
              {isDairy && <DataRow label="सध्या दूध संकलन (लिटर/दिवस)" value={d.milkCollection} />}
              {isDairy && <DataRow label="एकूण संलग्न शेतकरी संख्या" value={d.farmerCount} />}
            </TableBody>
          </Table>
        </section>

        {/* २. पशुधन माहिती */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>२. पशुधन माहिती</h4>
          <Table>
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="एकूण जनावरे" value={d.livestock?.totalAnimals} />
                  <DataRow label="गायी" value={d.livestock?.cows} />
                  <DataRow label="म्हशी" value={d.livestock?.buffaloes} />
                  <DataRow label="वासरे" value={d.livestock?.calves} />
                  <DataRow label="दूध देणारी जनावरे" value={d.livestock?.milkingAnimals} />
                  <DataRow label="प्रति जनावर सरासरी दूध उत्पादन (लिटर/दिवस)" value={d.livestock?.avgMilkPerAnimal} />
                </>
              ) : (
                <>
                  <DataRow label="गायी" value={d.animalCount?.cows} />
                  <DataRow label="म्हशी" value={d.animalCount?.buffaloes} />
                  <DataRow label="वासरे" value={d.animalCount?.calves} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ३. पशुखाद्य वापर */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>३. पशुखाद्य वापर माहिती</h4>
          <Table>
            <TableBody>
              <DataRow label="खाद्य प्रकार" value={d.feedType || d.currentBrand} />
              {!isDairy && <DataRow label="वापर कालावधी" value={d.usageDuration} />}
              <DataRow label="खाद्य देण्याची वारंवारता (दिवसातून)" value={d.feedFrequency || d.frequency} />
              <DataRow label="प्रति जनावर दररोज खाद्य (किलो)" value={d.dailyFeedPerAnimal || d.dailyQtyPerAnimal} />
              <DataRow label="पूरक खाद्य वापरता का?" value={d.supplements || d.otherFeeds} />
              {(d.otherSupplement || d.otherFeedText) && <DataRow label="इतर पूरक खाद्य" value={d.otherSupplement || d.otherFeedText} />}
            </TableBody>
          </Table>
        </section>

        {/* ४. ब्रँड व पोषण माहिती */}
        {isDairy && d.brandsInfo && d.brandsInfo.length > 0 ? (
          <section>
            <h4 className="font-bold text-primary mb-2 border-b pb-1">४. ब्रँड व पोषण माहिती</h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-[10px] font-bold">ब्रँड</TableHead>
                    <TableHead className="text-[10px] font-bold">किंमत</TableHead>
                    <TableHead className="text-[10px] font-bold">प्रोटीन</TableHead>
                    <TableHead className="text-[10px] font-bold">फॅट</TableHead>
                    <TableHead className="text-[10px] font-bold">कॅल्शियम</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.brandsInfo.map((b: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-[10px] font-medium">{b.name}</TableCell>
                      <TableCell className="text-[10px]">₹{b.price}</TableCell>
                      <TableCell className="text-[10px]">{b.protein}%</TableCell>
                      <TableCell className="text-[10px]">{b.fat}%</TableCell>
                      <TableCell className="text-[10px]">{b.calcium}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ) : !isDairy ? (
          <section>
            <h4 className="font-bold text-accent mb-2 border-b pb-1">३-४. ब्रँड निवड व गुणवत्ता</h4>
            <Table>
              <TableBody>
                <DataRow label="निवड करण्याचे कारण" value={d.selectionReason} />
                <DataRow label="सुरुवात कशी झाली" value={d.startMethod} />
                <DataRow label="फीडची गुणवत्ता" value={d.quality} />
                <DataRow label="दूध उत्पादन वाढले का?" value={d.milkIncrease} />
                <DataRow label="आरोग्य सुधारले का?" value={d.healthImprovement} />
                <DataRow label="जनावरांना आवडते का?" value={d.likesFeed} />
                <DataRow label="फॅट/SNF मध्ये फरक?" value={d.fatDiff} />
              </TableBody>
            </Table>
          </section>
        ) : null}

        {/* ५. खरेदी पद्धत / किंमत */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>५. खरेदी व किंमत माहिती</h4>
          <Table>
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="खरेदी पद्धत" value={d.purchaseMethod} />
                  {d.purchaseMethod === 'Credit' && <DataRow label="उधारीचे दिवस" value={d.creditDays} />}
                </>
              ) : (
                <>
                  <DataRow label="एका पोत्याची किंमत (₹)" value={d.bagPrice} />
                  <DataRow label="पोत्याचे वजन (किलो)" value={d.bagWeight} />
                  <DataRow label="महिन्याला लागणारी पोती" value={d.monthlyBags} />
                  <DataRow label="खरेदीचा स्त्रोत" value={d.purchaseSource} />
                  <DataRow label="उधारी मिळते का?" value={d.hasCredit} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ६. पुरवठा माहिती / ब्रँड तुलना */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>६. पुरवठा व तुलना</h4>
          <Table>
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="खरेदीचा स्त्रोत" value={d.supplySource === 'Other' ? d.otherSupplySource : d.supplySource} />
                  <DataRow label="पुरवठादाराचे नाव" value={d.supplierName} />
                  <DataRow label="पुरवठा वेळेवर मिळतो का?" value={d.timelySupply} />
                </>
              ) : (
                <>
                  <DataRow label="यापूर्वी वापरलेले ब्रँड" value={d.previousBrands} />
                  <DataRow label="चांगला वाटणारा ब्रँड" value={d.betterBrand} />
                  <DataRow label="ब्रँड बदलण्याचे कारण" value={d.switchReason} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ७ & ८. खर्च, गुणवत्ता व घटक */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>७-८. खर्च व गुणवत्ता विश्लेषण</h4>
          <Table>
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="महिन्याला एकूण खर्च (₹)" value={d.monthlyExp} />
                  <DataRow label="महिन्याला लागणारी पोती" value={d.monthlyBags} />
                  <DataRow label="खाद्याबद्दल समाधान" value={d.satisfaction} />
                  <DataRow label="दूध उत्पादन वाढले का?" value={d.milkIncrease} />
                  <DataRow label="सर्वात चांगला ब्रँड" value={d.bestBrand} />
                </>
              ) : (
                <>
                  <DataRow label="सहज उपलब्धता?" value={d.easyAvailability} />
                  <DataRow label="प्रतिनिधी भेट देतात का?" value={d.repVisit} />
                  <DataRow label="सॅम्पल/माहिती मिळते का?" value={d.samplesInfo} />
                  <DataRow label="घटक माहिती आहे का?" value={d.knowsIngredients} />
                  {d.packNutrition && (
                    <DataRow label="पॅकवरील घटक (%)" value={`प्रोटीन: ${d.packNutrition.protein}%, फॅट: ${d.packNutrition.fat}%`} />
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ९. साठवण / रेटिंग */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>९. साठवण व समाधान</h4>
          <Table>
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="गोदाम क्षमता (MT)" value={d.warehouseCapacity} />
                  <DataRow label="साठवण सुविधा आहे का?" value={d.hasStorage} />
                </>
              ) : (
                <DataRow label="एकूण समाधान रेटिंग" value={`${d.rating} / 5`} />
              )}
            </TableBody>
          </Table>
        </section>

        {/* १०. समस्या व सूचना */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>१०. समस्या व सूचना</h4>
          <Table>
            <TableBody>
              <DataRow label="मुख्य समस्या" value={isDairy ? d.mainProblem : d.problems} />
              {d.otherProblem && <DataRow label="इतर समस्या" value={d.otherProblem} />}
              {isDairy ? (
                <DataRow label="नवीन सॅम्पल ट्राय करणार का?" value={d.sampleTrial} />
              ) : (
                <DataRow label="सुधारणा आवश्यक" value={d.improvements} />
              )}
              {!isDairy && <DataRow label="स्वस्त मिळाल्यास ब्रँड बदलणार का?" value={d.switchIfCheaper} />}
              <DataRow label="चांगल्या खाद्याबद्दल मत/गुण" value={d.goodFeedOpinion || d.idealFeedQualities} />
            </TableBody>
          </Table>
        </section>

        {/* सर्वेक्षक तपशील */}
        <section className="bg-muted/30 p-3 rounded-lg border border-dashed">
          <h4 className="font-bold mb-2 text-xs uppercase tracking-wider text-muted-foreground">सर्वेक्षक तपशील</h4>
          <Table>
            <TableBody>
              <DataRow label="सर्वे करणाऱ्याचे नाव" value={survey.surveyorName} />
              <DataRow label="ID नंबर" value={survey.surveyorId} />
              <DataRow label="दिनांक" value={d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')} />
            </TableBody>
          </Table>
        </section>
      </div>
    );
  };

  const SurveyItem = ({ survey }: { survey: SurveyRecord }) => (
    <Card key={survey.id} className="bg-white hover:shadow-md transition-all border-primary/10 overflow-hidden mb-4">
      <CardContent className="p-0">
        <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className={`p-3 rounded-full shrink-0 ${survey.type === 'dairy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {survey.type === 'dairy' ? <FileText className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {survey.data.dairyName || survey.data.farmerName}
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {survey.data.village}, {survey.data.taluka}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
                <Badge variant={survey.type === 'dairy' ? 'default' : 'secondary'} className={`${survey.type === 'dairy' ? 'bg-primary' : 'bg-accent'} text-[10px]`}>
                  {survey.type === 'dairy' ? 'गवळी/चिलिंग सेंटर' : 'शेतकरी ब्रँड'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end no-print">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 gap-2 border-primary text-primary hover:bg-primary/10" 
              onClick={() => {
                setSelectedSurvey(survey);
                setIsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" /> <span className="hidden sm:inline">View</span>
            </Button>

            <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleDelete(survey.id)}>
              <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">माझी सर्वेक्षणे (My Surveys)</h1>
            <p className="text-muted-foreground text-sm">तुमच्याद्वारे पूर्ण केलेल्या सर्वेक्षणांची यादी.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="शोध (नाव, गाव...)" 
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <Tabs defaultValue="all" className="w-full no-print">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 p-1">
            <TabsTrigger value="all" className="text-xs md:text-sm gap-2">
              <LayoutDashboard className="h-4 w-4 hidden sm:inline" /> सर्व रिपोर्ट
            </TabsTrigger>
            <TabsTrigger value="dairy" className="text-xs md:text-sm gap-2">
              <FileText className="h-4 w-4 hidden sm:inline" /> गवळी/चिलिंग सेंटर
            </TabsTrigger>
            <TabsTrigger value="farmer" className="text-xs md:text-sm gap-2">
              <ClipboardList className="h-4 w-4 hidden sm:inline" /> शेतकरी ब्रँड
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filterSurveys().length === 0 ? (
              <EmptyState />
            ) : (
              filterSurveys().map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>

          <TabsContent value="dairy">
            {filterSurveys('dairy').length === 0 ? (
              <EmptyState message="गवळी/चिलिंग सेंटर सर्वेक्षण रिपोर्ट उपलब्ध नाहीत." />
            ) : (
              filterSurveys('dairy').map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>

          <TabsContent value="farmer">
            {filterSurveys('farmer').length === 0 ? (
              <EmptyState message="शेतकरी ब्रँड सर्वेक्षण रिपोर्ट उपलब्ध नाहीत." />
            ) : (
              filterSurveys('farmer').map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>
        </Tabs>

        {/* Detailed Report Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center border-b pb-2">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {selectedSurvey?.type === 'dairy' ? <FileText className="text-primary" /> : <ClipboardList className="text-accent" />}
                  सविस्तर रिपोर्ट: {selectedSurvey?.data.dairyName || selectedSurvey?.data.farmerName}
                </DialogTitle>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1 no-print">
                  <Printer className="h-4 w-4" /> प्रिंट
                </Button>
              </div>
            </DialogHeader>
            {selectedSurvey && renderDetailedReport(selectedSurvey)}
          </DialogContent>
        </Dialog>

        {/* Print view only */}
        <div className="hidden print:block space-y-8">
          <h1 className="text-2xl font-bold text-center border-b pb-4 mb-8">Cattle Feed Survey Report</h1>
          {surveys.map(survey => (
            <div key={survey.id} className="border p-4 rounded-lg mb-8 break-inside-avoid shadow-sm">
              <div className="flex justify-between items-center border-b pb-2 mb-4 bg-muted/10 p-2">
                <span className="font-bold text-lg">{survey.type === 'dairy' ? 'गवळी/चिलिंग सेंटर' : 'शेतकरी ब्रँड'} सर्वेक्षण</span>
                <span className="text-sm">तारीख: {new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
              </div>
              {renderDetailedReport(survey)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message = "कोणतेही सर्वेक्षण उपलब्ध नाही." }: { message?: string }) {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
