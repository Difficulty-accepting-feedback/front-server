"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

const questions = [
    { id: 1, title: "어떤 활동을 가장 선호하나요?", options: ["스터디","요리","운동","독서"] },
    { id: 2, title: "활동 시간을 언제로 원하시나요?", options: ["아침","점심","저녁","야간"] },
    { id: 3, title: "그룹 인원은 몇 명이 좋으신가요?", options: ["2–3명","4–6명","7–10명","무관"] },
    { id: 4, title: "활동 빈도는?", options: ["주 1회","주 2–3회","주 4회 이상","자유"] },
    { id: 5, title: "자신을 어필할 한 마디를 남겨주세요", type: "text" },
]

export default function MatchSurveyPage() {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<string[]>(
        Array(questions.length).fill("")
    )
    const current = questions[step]

    const selectOption = (opt: string) => {
        const copy = [...answers]; copy[step] = opt; setAnswers(copy)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100 p-6">
            <Card className="w-full max-w-3xl bg-white/30 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                {/* 단계 표시 */}
                <div className="flex px-6 py-4">
                    {questions.map((q, i) => (
                        <div key={q.id} className="flex-1 px-1">
                            <div
                                className={`h-2 rounded-full transition-colors ${
                                    i <= step
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                                        : "bg-emerald-200/50"
                                }`}
                            />
                        </div>
                    ))}
                </div>

                {/* 질문·답변 영역 */}
                <div className="flex">
                    {/* 왼쪽: 질문 */}
                    <div className="w-1/2 border-r border-emerald-200 p-8 flex items-center">
                        <div>
                            <div className="text-sm text-emerald-700 mb-2">
                                {step+1}/{questions.length}
                            </div>
                            <h2 className="text-3xl font-bold text-emerald-900">
                                {current.title}
                            </h2>
                        </div>
                    </div>

                    {/* 오른쪽: 답변 */}
                    <div className="w-1/2 p-8 flex flex-col space-y-4">
                        {current.type === "text" ? (
                            <Textarea
                                placeholder="자유롭게 입력하세요"
                                className="h-40 text-lg rounded-xl border-emerald-200 focus:border-emerald-500"
                                value={answers[step]}
                                onChange={e => selectOption(e.target.value)}
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {current.options.map(opt => (
                                    <Button
                                        key={opt}
                                        variant="outline"
                                        className={`py-4 text-lg rounded-xl transition-all duration-200 ${
                                            answers[step] === opt
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                : "text-emerald-800 hover:bg-emerald-50"
                                        }`}
                                        onClick={() => selectOption(opt)}
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 이전/다음 */}
                <div className="flex justify-between px-8 py-6 bg-white/20">
                    <Button
                        variant="ghost"
                        disabled={step === 0}
                        onClick={() => setStep(s => s - 1)}
                    >
                        이전
                    </Button>
                    {step < questions.length - 1 ? (
                        <Button
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full shadow-lg"
                            disabled={!answers[step]}
                            onClick={() => setStep(s => s + 1)}
                        >
                            다음
                        </Button>
                    ) : (
                        <Button
                            className="bg-gradient-to-r from-teal-600 to-green-600 text-white px-8 py-3 rounded-full shadow-lg"
                            disabled={!answers[step]}
                            onClick={() => alert("제출되었습니다!")}
                        >
                            제출하기
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}
