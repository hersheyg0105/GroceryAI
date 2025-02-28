# Project Overview

Your goal is to build a next.js applicatoin that allows users to input a list of groceries, and on click of a button it will call an open ai api to categorieze that list into categories like fruits, vegetables, meats, dairy, herbs, spices, and oils.

Technologies Used
- Next.js
- OpenAI API
- Tailwind CSS
- Typescript
- Stripe for donations

# Core Functionalities

## Screen Layout

The screen will be divided into 2 parts, the left and the right. The left will be for the input section, and the right will be for the output section.

## Input Section

The input section will be a numbered list by default, and the user can enter items into the list by typing them in and pressing enter the user will be taken to the new line where they can put a new grocery item.

## Output Section

The output section will be where that list of groceries will be organized into different categories such as fruits, vegetables, meats, dairy, herbs, spices, and oils. On the top right of the output section will be a copy button, that will copy all the text in the output section to the clipboard, that way they can paste it in some messaging app to send to their family members who are shopping for groceries.

## Categorize Groceries Button

At the bottom of this 2 part screen, there will be a button called "Categorize Groceries" that will call the open ai api to categorize the list of groceries into different categories such as fruits, vegetables, meats, dairy, herbs, spices, and oils.

## Error handling
- comprehensive input valiations
- user friendly error messages
- network error handling
- api error management
- file cleanup on error
- development mode stack traces

## Donations section
- Create a new component called "Donations" that will implement a slider with predefined amounts of 10, 20, 30, and 40 dollars.
- style the slider using tailwind css
- add amount dispaly that updates in real time
- update visual feedback on amount change
- add a donate button that triggers the strip checkout
- handle loading states during payment processing
- display appropriate error messages using toast notifications

## Initial Strip Setup
- sign up for a stripe account and get API keys
- add environment varaibles to .env.local


# Documentation

The following code snippet demonstrates how to use OpenAI's API to generate text. This is an example but you will do something simialar, role 

import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        {
            role: "system",
            content: "You are a helpful assistant that organizes grocery lists into categories such as Dairy, Fruits, Vegetables, Spices, Frozen, Meats, Snacks, and Beverages."
        },
        {
            role: "user",
            content: "Milk, apples, chicken, cinnamon, ice cream, lettuce, soda"
        }
    ]
});

console.log(completion.choices[0].message.content);
