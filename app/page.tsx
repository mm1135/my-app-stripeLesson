import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


const getAllLessons = async () => {
  const supabase = createServerComponentClient({ cookies });
  const { data: lessons} = await supabase.from("lesson").select("*");
  // console.log(lessons);
  return lessons;
}

export default async function Home() {
  const lessons = await getAllLessons();

  return (
    <div>
      <main className="w-full max-w-3xl mx-auto my-16 px-2 space-y-4">
        {lessons?.map((lesson) => (
          <Link href={`/${lesson.id}`} key={lesson.id} className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
                {/* <CardDescription></CardDescription> */}
              </CardHeader>
              <CardContent>
                <p>{lesson.description}</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  {/* レッスンの追加情報があれば表示 */}
                  詳細を見る →
                </p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </main>
    </div>
  );
}
