import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressItem {
  title: string;
  progress: number;
  details: string;
}

const progressData: ProgressItem[] = [
  {
    title: "1- اخذ پروانه احداث و انعقاد قرارداد ساتبا",
    progress: 100,
    details: "زمان برنامه ای سیستمی: 1403/03/30 - 1403/06/27 | تاخیر : 170 روز",
  },
  {
    title: "2- مجوزها",
    progress: 37.8571,
    details: "زمان برنامه ای سیستمی: 1403/03/30 - 1403/06/27 | تاخیر : 321 روز",
  },
  {
    title: "3- تامین منابع مالی",
    progress: 0,
    details: "زمان برنامه ای سیستمی: 1403/03/30 - 1403/06/27 | تاخیر : 321 روز",
  },
  {
    title: "4- مطالعات مهندسی پروژه",
    progress: 0,
    details: "زمان برنامه ای سیستمی: 1403/03/30 - 1403/06/27 | تاخیر : 321 روز",
  },
  {
    title: "5- انتخاب پیمانکاران احداث نیروگاه",
    progress: 0,
    details: "زمان برنامه ای سیستمی: 1403/03/30 - 1403/06/27 | تاخیر : 321 روز",
  },
  {
    title: "6- تجهیز کارگاه و فعالیت های مقدماتی",
    progress: 0,
    details: "زمان برنامه ای سیستمی: 1403/03/30 - 1403/10/26 | تاخیر : 201 روز",
  },
  {
    title: "7- ساخت نیروگاه",
    progress: 0,
    details: "زمان برنامه ای سیستمی: 1403/03/30 - 1404/02/25 | تاخیر : 81 روز",
  },
  {
    title: "8- اتصال به شبکه",
    progress: 0,
    details: "زمان برنامه ای سیستمی: 1403/06/27 - 1404/03/24 | تاخیر : 51 روز",
  },
];

const ProjectProgress = () => {
  const totalProgress = 29.3333;

  return (
    <section className="py-12 md:py-20 bg-background" dir="rtl">
      <div className="container mx-auto px-4">
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-center text-primary">
              درصد پیشرفت پروژه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <p className="text-lg text-foreground">
                درصد پیشرفت از وزن کلی:{" "}
                <span className="font-bold text-primary">{totalProgress.toFixed(4)}%</span>
              </p>
              <Progress value={totalProgress} className="w-full mt-2 h-4" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {progressData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <Progress value={item.progress} className="w-full h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                  <p className="text-xs text-foreground mt-1">پیشرفت: <span className="font-bold">{item.progress.toFixed(2)}%</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProjectProgress;
