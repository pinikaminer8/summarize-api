# Building a simple project with AI

Let's go through the steps to build a simple AI project.
Our objective is to learn effective ways to leverage AI for building projects.

The project we'll be developing is an AI Summarization Proxy API endpoint that takes text → summarizes it using an LLM → returns structured JSON (title, summary, keywords).

We’ll use this AI Summarization Gateway as a vehicle to learn the process of AI-augmented development. Below is a repeatable, step-by-step playbook you can use. 
It’s intentionally tool-agnostic and focuses on thinking, scoping, and evaluation—not code.


## Step 1: Define - Frame the Project Requirements
   **Goal:** Agree on Goals & criteria before touching tech.

   1. ### One line description of the project
      "Expose an HTTP endpoint that accepts text and returns a concise summary with title, key points, sentiment, and keywords."

   2. ### Success Criteria (acceptance tests)
      - [ ] Latency ≤ 5s for ≤ 10k tokens input (text).
      - [ ] Factual: summary must only reflect source.
      - [ ] Structure: output matches JSON schema 100% of the time.
  

## Step 2: Describe - Treat the AI as a teammate, not a black box
   **Goal:** Break the project down into User Stories.

   1. ### User Story
       As a user, I want to be able send text and get a summary of the text so that I can quickly understand the key points of the text.


## Step 3: Detail - Requirements to Interfaces 
   **Goal:** Turn product goals into explicit contracts.   

   1. ### Define API Contract
      - [ ] Define API URL endpoint.
      - [ ] Define Request and Response schemas.
      - [ ] Define Error codes.

   2. ### Define The tech stack
      - [ ] HTTP server.
      - [ ] LLM.
  
   3. ### Test the API
      - [ ] Generate a Postman JSON file to test the API.
      👉  To keep things simpler, we will implement unit testing at a later stage.



## Step 4: Iterate
   **Goal:** see how the model behaves and then refine:

      - If it’s too long → add “no more than 100 words.”
      - If it misses key points → add “include the main idea of each section.”
      - If it hallucinates → add “use only information present in the text.”

       👉 Tip: You don’t debug code; you debug instructions.
  
## Step 5: Extend - Add more features to the project
   **Goal:** AI handles reasoning; 
    backend handles structure, rules, and persistence.

      - Define & Validate:
         - Max input size.
         - Allowed MIME types.
         - Auth (token).
         - Rate limits.
      - Add support for audio
      - Add support for PDF files.
      - Add: word_count or created_at fields to the response.
      - Save summaries to a DB.
      - HTTP logging.
      - Error logging.
      - Analytics.

      👉 Update the tech stack and code librariesaccordingly.
