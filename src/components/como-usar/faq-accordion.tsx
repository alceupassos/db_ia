'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-light">Perguntas Frequentes</h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AccordionItem
              value={`item-${index}`}
              className="border border-border/50 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
}
