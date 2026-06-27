import "dotenv/config";
import { Agent, tool, run } from "@openai/agents"; 
import { z } from "zod";

const GetWeatherOutSchema = z.object({
    city: z.string().describe("The city to get the weather for."),
    degrees_c: z.number().describe("The temperature in degrees Celsius."),
    condition: z.string().optional().describe("The weather condition."),
}).describe("The weather for a given city.");

const getWeather = tool({
    name: "getWeather",
    description: "Return the weather for a given city.",
    parameters: z.object({
        city: z.string(),
    }),
    execute: async ({ city }) => {
        const response = await fetch(`https://wttr.in/${city.toLowerCase()}?format=%C+%t`);
        const data = await response.text();
        console.log("Weather data:", data);
        return data;
    },
});

const wetherAgent = new Agent({
    name: "Wether Agent",
    instructions: "You are a helpful weather bot.",
    model: "gpt-4o-mini",
    tools: [getWeather],
    outputType: GetWeatherOutSchema,
});


async function main(query) {
    const result = await run(wetherAgent, query);
    console.log(result.finalOutput);
}
main("What is the weather in Tokyo?")

// const sendEmail = tool({
//     name: "sendEmail",
//     description: "Send an email to a given email address.",
//     parameters: z.object({
//         email: z.string(),
//         subject: z.string(),
//         body: z.string(),
//     }),
//     execute: async ({ email, subject, body }) => {
//         const response = await fetch(`https://api.emailjs.com/api/v1.0/email/send`, {
//             method: "POST",
//             body: JSON.stringify({ email, subject, body }),
//         });
//         const data = await response.json();
//         console.log("Email data:", data);
//         return data;
//     },
// });
