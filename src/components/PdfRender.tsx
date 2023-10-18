'use client'
import {zodResolver} from '@hookform/resolvers/zod'
import { ChevronDown, ChevronLeft, ChevronUp, Loader2, RotateCw, Search } from 'lucide-react';
import {Document, Page,pdfjs} from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { useToast } from './ui/use-toast';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import {useResizeDetector} from 'react-resize-detector'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState,} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { set } from 'date-fns';
import { cn } from '@/lib/utils';
//import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from './ui/dropdown-menu';
import SimpleBar from 'simplebar-react';
import PdfFullScreen from './PdfFullScreen';

interface PdfRendererprops {
  url:string
}

const PdfRenderer = ({url}:PdfRendererprops) => {
  const {toast}= useToast();
  const {width,ref} = useResizeDetector();
  const [numPages, setNumPages] = useState<number>();
  const [currpage, setCurrPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation,setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null)

  const isLoading = renderedScale !== zoom

  const CustomPageValidator = z.object({
    page:z.string().refine((num)=>Number(num) > 0 && Number(num) <= numPages!)
  })
  type TCustomPageValidator = z.infer<typeof CustomPageValidator>

  const {register,handleSubmit,formState:{errors},setValue}=useForm<TCustomPageValidator>({
    defaultValues:{
      page:'1'
    },
    resolver:zodResolver(CustomPageValidator),
  })

  const handlePageSubmit = ({
    page,
    }:TCustomPageValidator) => {
    setCurrPage(Number(page))
    setValue('page',String(page))
  }


  return ( <div className="w-full bg-white rounded-md shadow flex flex-col items-cnter">
    <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
      <div className="flex items-center gap-1.5">
      < Button  disabled={currpage<=1} variant='ghost' aria-label='previous page'
      onClick={()=>{
        setCurrPage((currpage)=> currpage-1)
        setValue('page',String(currpage-1))
      }}
      >
      <ChevronDown className='h-3 w-4'/>
    </Button>
      <div className="flex items-center gap-1.5">
        <Input {...register('page')} className={cn('w-12 h-8',errors.page && 'focus-visible:ring-red-500')} onKeyDown={(e)=>
        {
          if(e.key==='Enter')
          {
            handleSubmit(handlePageSubmit)()
            
          }
        }
        } />
        <p className='text-zinc-700 text-sm space-x-1'>
          <span>/</span>
          <span>{numPages ?? 'x'}</span>
        </p>
      </div>
      < Button disabled={currpage===numPages} variant='ghost' aria-label='previous page' onClick={()=>{
        setCurrPage(currpage+1)
        setValue('page',String(currpage+1))
      }}>
      <ChevronUp className='h-3 w-4'/>
    </Button>
    </div>
    <div className='space-x-2'>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button  className='gap-1.5' variant='ghost' aria-label='Zoom'>
        <Search className='h-4 w-4'/>
        {zoom*100}%<ChevronDown className='h-3 w-3 opacity-50'/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={()=>setZoom(1)}>100%</DropdownMenuItem>
        <DropdownMenuItem onSelect={()=>setZoom(1.5)}>150%</DropdownMenuItem>
        <DropdownMenuItem onSelect={()=>setZoom(2)}>200%</DropdownMenuItem>
        <DropdownMenuItem onSelect={()=>setZoom(2.5)}>250%</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='ghost' aria-label='Rotate 90 degreees' onClick={()=>{
        setRotation((rotation)=>rotation+90)
      }}>
        <RotateCw className='h-4 w-4'/>
      </Button>
      <PdfFullScreen fileUrl={url} />
    </div>
    </div>
    <div className="flex-1 w-full max-h-screen">
      <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
      <div ref={ref}>
        <Document loading={
          <div className='flex justify-center'>
            <Loader2 className='my-24 h-6 w-6 animate-spin'/>
          </div>
        } 
        onLoadError={()=>{
          toast({
            title:'Error loading PDF',
            description:'prlease try again later',
            variant:'destructive'
          })
        }}
        onLoadSuccess={({numPages})=>{
          setNumPages(numPages)
        }
        }
        file={url} 
        className='max-h-full'>
          {isLoading && renderedScale ? <Page width={width ? width :1} pageNumber={currpage} scale={zoom} rotate={rotation} key={'@'+renderedScale}/>:null}
          <Page 
          className={cn(isLoading ? 'hidden':'')}
          width={width ? width :1} 
          pageNumber={currpage} 
          scale={zoom} 
          rotate={rotation}
          key={'@'+zoom}
          loading={
            <div className='flex justify-center'>
              <Loader2 className='my-24 h-6 w-6 animate-spin'/>
            </div>
          }
          onRenderSuccess={()=>setRenderedScale(zoom)}
          />
        </Document>
      </div>
      </SimpleBar>
    </div>
    </div>
    );
}
export default PdfRenderer;