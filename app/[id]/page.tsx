import { Database } from '@/lib/database.types';
import { createServerComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import React from 'react'
import { YouTubeEmbed } from "@next/third-parties/google"
import { extractYouTubeVideoId } from '@/utils/extractYoutubeVideoId';

const getDetailLessons = async (id: number, supabase: SupabaseClient<Database>) => {
    const { data: lessons} = await supabase.from("lesson").select("*").eq("id", id).single();
    // console.log(lessons);        
    return lessons;
}

const getPremiumContent = async (id: number, supabase: SupabaseClient<Database>) => {
  const { data: video} = await supabase.from("premium_content").select("video_url").eq("id", id).single();
  // console.log(lessons);     
  return video;
}
  

const LessonDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  const {id} = await params;
  
  // paramsはすでにawaitされているので、直接使用可能
  const lesson = await getDetailLessons(Number(id), supabase)
  const video = await getPremiumContent(Number(id), supabase)
  const videoId = extractYouTubeVideoId(video?.video_url as string) as string

  return (
    <div className='max-w-3xl mx-auto my-16 px-2 space-y-4'>
        <h1 className='text-2xl font-bold'>{lesson?.title}</h1>
        <p className='text-gray-500'>{lesson?.description}</p>
        <YouTubeEmbed height={400} videoid={videoId} />
    </div>
  )
}

export default LessonDetailPage;