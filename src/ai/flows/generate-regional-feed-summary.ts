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

Example of expected output structure:
"In the {{taluka}} taluka of {{district}} district, the survey data indicates that brands like [Brand A], [Brand B], and [Brand C] are most frequently used. Brand A is popular for its high protein content (typically around 22% crude protein, 5% fat) and is generally associated with good milk yield. Brand B, often chosen for its affordability, contains a balanced mix of maize, oil cake, and minerals, with farmers reporting moderate satisfaction, sometimes citing issues with availability. Brand C focuses on overall animal health with ingredients like specific mineral mixtures and probiotics. Overall farmer satisfaction across the region is [High/Moderate/Low], with common positive feedback on [mention positives] and frequent concerns regarding [mention concerns like price or quality consistency]."

Provide the summary in Marathi if the input names are Marathi, otherwise use English.`,
});

const regionalFeedInsightsFlow = ai.defineFlow(
  {
    name: 'regionalFeedInsightsFlow',
    inputSchema: RegionalFeedInsightsInputSchema,
    outputSchema: RegionalFeedInsightsOutputSchema,
  },
  async (input) => {
    // In a full implementation, you would query a database here to fetch
    // aggregated survey data for the given district and taluka.
    // For this example, the prompt is designed to generate a plausible summary
    // based on the district and taluka names, acting as if it has access to such data.
    const { output } = await regionalFeedInsightsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate regional feed insights summary.');
    }
    return output;
  }
);
