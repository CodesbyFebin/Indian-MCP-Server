// components/ui/accordion.tsx
// Accordion component built on Radix UI

'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.AccordionItem>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.AccordionItem>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.AccordionItem
    ref={ref}
    className={cn('border-b', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.AccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.AccordionTrigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.AccordionTrigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between py-4 font-medium hover:no-underline',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200" />
  </AccordionPrimitive.AccordionTrigger>
));
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.AccordionContent>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.AccordionContent>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.AccordionContent
    ref={ref}
    className={cn(
      'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className,
    )}
    {...props}
  >
    <div className="py-4">{children}</div>
  </AccordionPrimitive.AccordionContent>
));
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
