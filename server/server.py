from quart import Quart, jsonify, request
from quart_cors import cors
import asyncio
import dotenv
from dotenv import load_dotenv
import os
app = Quart(__name__)
app = cors(app, allow_origin="*")  # Adjust CORS as necessary for your environment
load_dotenv()

# Placeholder imports and function definitions (you should replace these with your actual imports and function definitions)
from groq import AsyncGroq  # This import is hypothetical as it depends on the actual library

# Define necessary functions for interfacing with the Groq API
def setup_prompt(trait, description):
    return f"""You are a member of the English essay writing test evaluation committee. Your responsibility is to score the essay in terms of "{trait}". Description: {description}"""

def retrieve_quotations(prompt, essay, trait):
    return f"""[Prompt] {prompt} [Essay] {essay} Task: List quotations from the essay relevant to the trait "{trait}" and evaluate whether each quotation is well-written."""

def score_trait(quotations, trait, scoring_criteria):
    return f"""[Quotations] {quotations} [Scoring Rubric] {scoring_criteria} Task: Based on the scoring rubric and the quotations provided above, rate the "{trait}" of this essay from 0 to 10. IMPORTANT: AFTER EXPLAINING WHY YOU GAVE THE SCORE IN DETAIL, PLEASE PROVIDE THE SCORE IN THIS FORMAT AT THE END OF THE PARAGRAPH '<final>number<final>' where 'number' is the final score , example: [explanation of the evaluation] <final>7.6<final>."""

async def send_prompt(client, model, messages):
    completion = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.2,
        max_tokens=1024,
        top_p=0.9,
        stream=True,
        stop=None
    )
    response_content = ""
    async for chunk in completion:
        response_content += chunk.choices[0].delta.content or ""
    return response_content.strip()

async def evaluate_trait(client, model, prompt, essay, trait, description, criteria):
    setup_text = setup_prompt(trait, description)
    retrieve_text = retrieve_quotations(prompt, essay, trait)
    quotations = await send_prompt(client, model, [{"role": "system", "content": setup_text}, {"role": "user", "content": retrieve_text}])
    score_text = score_trait(quotations, trait, criteria)
    score = await send_prompt(client, model, [{"role": "system", "content": score_text}])
    return score

async def evaluate_essay(api_key, model, prompt, essay, traits, descriptions, criteria_list):
    client = AsyncGroq(api_key=api_key)
    tasks = []
    for trait, description, criteria in zip(traits, descriptions, criteria_list):
        task = asyncio.create_task(evaluate_trait(client, model, prompt, essay, trait, description, criteria))
        tasks.append(task)
    scores = await asyncio.gather(*tasks)
    return dict(zip(traits, scores))

@app.route('/api/evaluate', methods=['POST'])
async def evaluate():
    data = await request.get_json()
    essay_text = data['essay']
    prompt_text = data['topic']
    api_key = os.getenv("API_KEY")  
    model = "llama3-8b-8192"
    # Traits and their descriptions
    traits = ["Task Response", "Coherence and Cohesion", "Lexical Resource", "Grammatical Range and Accuracy"]
    descriptions = [
        "Evaluates how well the prompt is understood and developed within the response.",
        "Assesses how well ideas are logically organized and connected within a written response.",
        "Evaluates the range and appropriateness of vocabulary used within a written response.",
        "Assesses the use of grammatical structures accurately."
    ]
    criteria = [
            """
            0-2:
            - Barely relevant or unrelated content to the given prompt. 
            - Lack of identifiable position or comprehension of the question.
            - Minimal or no development of ideas; content may be tangential or copied. 
            3-4: 
            - Partially addresses the prompt but lacks depth or coherence.
            - Discernible position, but unclear or lacking in support. 
            - Ideas are difficult to identify or irrelevant with some repetition. 
            5-6: 
            - Addresses main parts of the prompt but incompletely or with limited development.
            - Presents a position with unclear or repetitive development.
            - Some relevant ideas but insufficiently developed or supported.
            7-8:
            - Adequately addresses the prompt with clear and developed points.
            - Presents a coherent position with well-extended and supported ideas.
            - Some tendencies toward over-generalization or lapses in content, but mostly on point. 
            9-10: 
            - Fully and deeply explores the prompt with a clear, well-developed position. 
            - Extensively supported ideas relevant to the prompt.
            - Extremely rare lapses in content or support; demonstrates exceptional depth and insight. 
            """,

            """
            0-2:
            - Lack of coherence; response is off-topic or lacking in relevant message. 
            - Minimal evidence of organizational control or logical progression.
            - Virtually absent or ineffective use of cohesive devices and paragraphing. 
            3-4: 
            - Ideas are discernible but arranged incoherently or lack clear progression. 
            - Unclear relationships between ideas, limited use of basic cohesive devices.
            - Minimal or unclear referencing, inadequate paragraphing if attempted.
            5-6: 
            - Some underlying coherence but lacks full logical organization.
            - Relationships between ideas are somewhat clear but not consistently linked. 
            - Limited use of cohesive devices, with inaccuracies or overuse, and occasional repetition. 
            - Inconsistent or inadequate paragraphing. 
            7-8: 
            - Generally organized with a clear overall progression of ideas.
            - Cohesive devices used well with occasional minor lapses. 
            - Effective paragraphing supporting coherence, though some issues in sequencing or clarity within paragraphs.
            9-10: 
            - Effortless follow-through of ideas with superb coherence. 
            - Seamless and effective use of cohesive devices with minimal to no lapses.
            - Skilful paragraphing enhancing overall coherence and logical progression
            """,
            """
            0-2:
            - Minimal to no resource evident; extremely limitedvocabulary or reliance on memorized phrases.
            - Lack of control in word formation, spelling, andrecognition of vocabulary.
            - Communication severely impeded due to the absence of lexical range.
            3-4:
            - Inadequate or limited resource; vocabulary may
            be basic or unrelated to the task.
            - Possible dependence on input material or
            memorized language.
            - Errors in word choice, formation, or spelling
            impede meaning.
            5-6:
            - Adequate but restricted resource for the task.
            - Limited variety and precision in vocabulary,
            causing simplifications and repetitions.
            - Noticeable errors in spelling/word formation,
            with some impact on clarity.
            7-8:
            - Sufficient resource allowing flexibility and precision in expression.
            - Ability to use less common or idiomatic items,despite occasional inaccuracies.
            - Some errors in spelling/word formation with minimal impact on communication.
            9-10:
            - Full flexibility and precise use of a wide range of vocabulary.
            - Very natural and sophisticated control of lexical features with rare minor errors.
            - Skillful use of uncommon or idiomatic items, enhancing overall expression.
            """,
            """
            0-2:
            - Absence or extremely limited evidence of coherent sentence structures.
            - Lack of control in grammar, minimal to no use of sentence forms.
            - Language largely incomprehensible or irrelevant to the task.
            3-4:
            - Attempts at sentence forms but predominantly error-laden.
            - Inadequate range of structures with frequent grammatical errors.
            - Limited coherence due to significant errors impacting meaning.
            5-6:
            - Limited variety in structures; attempts at complexity with faults.
            - Some accurate structures but with noticeable errors and repetitions.
            - Clear attempts at complexity but lacking precision and fluency.
            7-8:
            - Adequate variety with some flexibility in using complex structures.
            - Generally well-controlled grammar but occasional errors.
            - Clear attempts at complexity and flexibility in sentence structures.
            9-10:
            - Extensive range with full flexibility and precision in structures.
            - Virtually error-free grammar and punctuation.
            - Exceptional command with rare minor errors, showcasing nuanced and sophisticated language use.
            """

    ]  # Please replace this with your actual criteria
    scores = await evaluate_essay(api_key, model, prompt_text, essay_text, traits, descriptions, criteria)
    return jsonify(scores)

if __name__ == '__main__':
    app.run(debug=True, port=8080)
