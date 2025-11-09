import { Bot, MessageCircle, Lightbulb, BookOpen } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { closeLogInModal, closeSignUpModal, openSignUpModal } from '@/redux/slices/modalSlice';
import LandingLayout from '@/components/landing/LandingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatbotPage() {
  const dispatch = useDispatch<AppDispatch>();

  const handleSignUpClick = () => {
    dispatch(closeLogInModal());
    dispatch(openSignUpModal());
  };

  return (
    <LandingLayout>
      <section className="px-4 sm:px-6 lg:px-8 py-24 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              <Bot className="w-4 h-4" />
              AI Study Assistant
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Have a tutor, lab mate, and TA
              <span className="text-gradient"> on call 24/7.</span>
            </h1>
            <p className="text-lg text-gray-600">
              Ask Nexus anything—from quick conceptual refreshers to detailed project breakdowns. Our assistant reads the same materials you do, so answers stay grounded in your syllabus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-linear-to-r from-cyan-500 to-blue-500 text-white" onClick={handleSignUpClick}>
                Try the assistant
              </Button>
              <Button size="lg" variant="outline" className="text-lg">See example prompts</Button>
            </div>
          </div>

          <div className="bg-white/85 rounded-3xl shadow-xl border border-purple-100 p-6 space-y-4">
            <header className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Live demo</p>
                <h3 className="text-lg font-semibold text-gray-900">Discrete Math Homework</h3>
              </div>
            </header>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="rounded-2xl bg-purple-50 px-4 py-3">
                <p className="font-semibold text-purple-700">You • 7:42 PM</p>
                <p>Can you sanity-check my proof for problem 3? I think I may have skipped a step.</p>
              </div>
              <div className="rounded-2xl bg-white border border-purple-100 px-4 py-3">
                <p className="font-semibold text-gray-900">Nexus Assistant • 7:42 PM</p>
                <p className="mt-1">
                  You correctly established the base case. When you applied strong induction, cite Lemma 2.1 explicitly before transitioning to k+1.
                  I highlighted the missing statement and generated a revised version for you—want it?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          <Card className="bg-white/85 backdrop-blur border-purple-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Lightbulb className="w-6 h-6" />
              </div>
              <CardTitle>Context-aware answers</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>Upload slides, PDFs, lab handouts, and problem sets. Nexus references them directly so responses cite the exact page and theorem.</p>
              <ul className="space-y-2 text-sm">
                <li>• Multi-course knowledge graph</li>
                <li>• Inline citation links</li>
                <li>• Multi-language support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur border-cyan-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <CardTitle>Guided learning paths</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>Generate personalized review plans before quizzes or midterms, complete with practice questions and curated resources.</p>
              <ul className="space-y-2 text-sm">
                <li>• Adaptive recap sessions</li>
                <li>• Auto-generated flashcards</li>
                <li>• Export to Notion or Anki</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur border-blue-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <CardTitle>Lab assistant mode</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>Switch to debugging guidance or data analysis support. The assistant can review code snippets, trace outputs, and suggest fixes.</p>
              <ul className="space-y-2 text-sm">
                <li>• Jupyter & VS Code extensions</li>
                <li>• Github repo context</li>
                <li>• Auto-formatted citations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Study with the confidence of always having backup.</h2>
          <p className="text-lg text-gray-600">
            Activate your personal AI assistant and bring better questions to office hours, project meetings, or study groups. Nexus scales with however you learn best.
          </p>
          <Button size="lg" className="bg-linear-to-r from-cyan-500 to-blue-500 text-white" onClick={handleSignUpClick}>
            Unlock the assistant
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
