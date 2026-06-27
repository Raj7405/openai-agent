import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";
import fs from 'node:fs/promises';
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';

//refund agent
const processRefund = tool({
    name: "processRefund",
    description: "This tool processes the refund for a customer",
    parameters: z.object({
        customerId: z.string(),
        reason: z.string(),
    }),
    execute: async function ({ customerId, reason }) {
        fs.appendFile('./refunds.txt', `Refunded customer ${customerId} for reason ${reason}\n`, 'utf8');
        return { refund_id: customerId + new Date().getTime() + reason, refund_status: "success" };
    },
})

const refundAgent = new Agent({
    name: "Refund Agent",
    instructions: `You are expert in issuing refunds to the customer`,
    tools: [processRefund],
})

//sales agent

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

//reception agent

const receptionAgent = new Agent({
    name: "Reception Agent",
    instructions: `
        ${RECOMMENDED_PROMPT_PREFIX}
        You are the customer facing agent expert in understanding what customer needs and then route them or handoff them to the right agent
    `,
    handoffDescription: `You have two agents available:
        - salesAgent: Expert in handling queries like all plans and pricing available. Good for new customers.
        - refundAgent: Expert in handling user queries for existing customers and issue refunds and help them
    `,
    handoffs: [salesAgent, refundAgent],
})

const main = async (query) => {
    const result = await run(receptionAgent, query);
    console.log(result.finalOutput);
    console.log(result.history);
}
main("hey, how are you?");
// main("I want to buy a plan. can tell me about the plans? list them all");
// main("I had a plan 399. I need a refund right now. my customer id is cust123 because of I am shifting to a new place");