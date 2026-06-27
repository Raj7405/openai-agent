import "dotenv/config";
import { Agent, tool, run } from "@openai/agents"; 
import { z } from "zod";
import fs from 'node:fs/promises';


const getAvailablePlans = tool({
    name: "getAvailablePlans",
    description: "Get the details of all available plans.",
    parameters: z.object({}),
    execute: async function () {
        return [
          { plan_id: '1', price_inr: 399, speed: '30MB/s' },
          { plan_id: '2', price_inr: 999, speed: '100MB/s' },
          { plan_id: '3', price_inr: 1499, speed: '200MB/s' },
        ];
    },
});

const processRefund = tool({
    name: "processRefund",
    description: "This tool processes the refund for a customer",
    parameters: z.object({
        customerId: z.string(),
        reason: z.string(),
    }),
    execute: async function ({ customerId, reason }) {
        fs.appendFile('./refunds.txt', `Refunded customer ${customerId} for reason ${reason}\n`, 'utf8');
        return {refund_id: customerId + new Date().getTime() + reason, refund_status: "success"};
    },
})

const refundAgent = new Agent({
    name: "Refund Agent",
    instructions: `You are expert in issuing refunds to the customer`,
    tools: [processRefund],
})

const salesAgent = new Agent({
    name: "Sales Agent",
    instructions: `
        You are an expert sales agent for an internet broadband comapny.
        Talk to the user and help them with what they need.
    `,
    tools: [
        getAvailablePlans, 
        refundAgent.asTool({
            toolName: "refundExpert",
            toolDescription: "Handles refund questions and requests.",
        }
    )],
})

async function runSalesAgent(query) {
    const result = await run(salesAgent, query);
    console.log(result.finalOutput);
}
// runSalesAgent("I want to buy a plan.");
runSalesAgent(
    `I had a plan 399. I need a refund right now. my customer id is cust123 because of I am shifting to a new place`
);