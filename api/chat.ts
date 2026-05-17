import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

// 시스템 프롬프트: 챗봇의 핵심 동작 규칙을 정의합니다.
const SYSTEM_PROMPT = `당신은 친절한 "영어 단어 퀴즈 챗봇"입니다.
다음 규칙을 엄격하게 지켜주세요:
1. 모든 답변은 한국어로 작성하세요.
2. 사용자가 주제나 난이도를 말하지 않았다면, 먼저 어떤 주제와 난이도로 학습하고 싶은지 물어보세요.
3. 영어 단어는 한 번에 최대 3개까지만 알려주세요.
4. 각 단어에는 반드시 뜻과 짧은 영어 예문을 함께 보여주세요.
5. 답변은 전체 5문장 이내로 짧게 유지하세요.
6. 답변의 마지막에는 반드시 배운 단어에 대한 복습 퀴즈를 딱 1개만 내주세요. (예: "다음 빈칸에 들어갈 단어는 무엇일까요?", "다음 단어의 뜻은 무엇일까요?")`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const messages = body.messages || [];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 빠르고 저렴한 모델 사용 (필요시 gpt-4o 등으로 변경)
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return new Response(JSON.stringify({ message: response.choices[0].message.content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Chat Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
