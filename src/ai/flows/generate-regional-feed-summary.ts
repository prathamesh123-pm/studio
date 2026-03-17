'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a regional summary
 * of cattle feed brands, their ingredients, and farmer satisfaction based on
 * specified district and taluka.
 *
 * - generateRegionalFeedSummary - A function that triggers the AI to provide regional feed insights.
 * - RegionalFeedInsightsInput - The input type for the generateRegionalFeedSummary function.
 * - RegionalFeedInsightsOutput - The return type for the generateRegionalFeedSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RegionalFeedInsightsInputSchema = z.object({
  district: z.string().describe('The name of the district for which to generate insights.'),
  taluka: z.string().describe('The name of the taluka (sub-district) within the district for which to generate insights.'),
});
export type RegionalFeedInsightsInput = z.infer<typeof RegionalFeedInsightsInputSchema>;

const RegionalFeedInsightsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A comprehensive AI-generated summary of the most prevalent cattle feed brands, their common ingredients, and overall farmer satisfaction in the specified region.'
    ),
});
export type RegionalFeedInsightsOutput = z.infer<typeof RegionalFeedInsightsOutputSchema>;

export async function generateRegionalFeedSummary(
  input: RegionalFeedInsightsInput
): Promise<RegionalFeedInsightsOutput> {
  return regionalFeedInsightsFlow(input);
}

const regionalFeedInsightsPrompt = ai.definePrompt({
  name: 'regionalFeedInsightsPrompt',
  input: { schema: RegionalFeedInsightsInputSchema },
  output: { schema: RegionalFeedInsightsOutputSchema },
  prompt: `You are an expert agricultural analyst specializing in livestock nutrition in Maharashtra.

You are tasked with generating a summary of cattle feed trends for the specific region:
District: {{{district}}}
Taluka: {{{taluka}}}

Based on hypothetical aggregated survey data for this district and taluka, identify:
1. The most prevalent cattle feed brands being used.
2. The common key ingredients found in these brands.
3. The overall farmer satisfaction levels with these brands, including any common issues or positive feedback.

Synthesize this information into a concise, insightful summary. Structure your response clearly, addressing each of the three points above.

IMPORTANT: Provide the ENTIRE summary in Marathi language. Use professional and helpful tone. Avoid grammatical errors. Ensure terms like "सुका चारा" and "ॲड पॉइंट्स" are used correctly if applicable.

Example of expected output structure (in Marathi):
"{{district}} जिल्ह्यातील {{taluka}} तालुक्यात, सर्वेक्षणानुसार प्रामुख्याने [ब्रँड A], [ब्रँड B], आणि [ब्रँड C] हे ब्रँड्स मोठ्या प्रमाणात वापरले जातात. [ब्रँड A] त्याच्या उच्च प्रोटीन गुणवत्तेमुळे लोकप्रिय आहे, ज्यामुळे दूध उत्पादनात चांगली वाढ दिसून येते. [ब्रँड B] हा वाजवी दरामुळे अधिक वापरला जातो, ज्यात मका आणि पेंड यांचे योग्य मिश्रण असते. एकंदरीत या भागात शेतकरी समाधान पातळी उच्च असून, पशुखाद्याच्या गुणवत्तेबाबत सकारात्मक मते आहेत."

Provide the summary now.`,
});

const regionalFeedInsightsFlow = ai.defineFlow(
  {
    name: 'regionalFeedInsightsFlow',
    inputSchema: RegionalFeedInsightsInputSchema,
    outputSchema: RegionalFeedInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await regionalFeedInsightsPrompt(input);
    if (!output) {
      throw new Error('क्षेत्रीय पशुखाद्य विश्लेषण अहवाल तयार करण्यास अडचण आली. कृपया पुन्हा प्रयत्न करा.');
    }
    return output;
  }
);
