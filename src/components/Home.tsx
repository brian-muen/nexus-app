import { Calendar, CheckSquare, Bot, ArrowRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../redux/store';
import { openSignUpModal, closeLogInModal } from '../redux/slices/modalSlice';
import PenguinLogo from '@/components/PenguinLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LandingLayout from '@/components/landing/LandingLayout';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();

  const handleSignUpClick = () => {
    dispatch(closeLogInModal());
    dispatch(openSignUpModal());
  };

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Now in Beta
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Your academic life,
                <span className="text-gradient"> perfectly synced</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Nexus integrates Canvas and Gradescope to automatically track assignments, generate smart to-do lists, and provide AI-powered study assistance. Stay organized, never miss a deadline.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-lg px-8 py-6"
                  onClick={handleSignUpClick}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-cyan-300 hover:bg-cyan-50"
                >
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-600 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free forever
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-cyan-300 to-blue-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <PenguinLogo className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Everything you need to <span className="text-gradient">succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto whitespace-pre-line!">
              Powerful features designed for students, by students. Perfected for daily use.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift border-2 border-transparent hover:border-cyan-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-400 to-blue-400 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Calendar Integration</CardTitle>
                <CardDescription className="text-base">Seamlessly sync with Canvas and Gradescope</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600">
                  Never manually enter an assignment again. Nexus automatically pulls all your upcoming work from Canvas and Gradescope into one unified calendar view.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Real-time sync with LMS platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Smart conflict detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Deadline reminders & notifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-transparent hover:border-cyan-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center mb-4">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Automated To-Do List</CardTitle>
                <CardDescription className="text-base">Smart task prioritization based on deadlines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600">
                  Your assignments automatically transform into an intelligent to-do list, prioritized by urgency, difficulty, and your personal schedule.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>AI-powered priority sorting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Time estimation for each task</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Progress tracking & analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-transparent hover:border-cyan-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">AI Study Assistant</CardTitle>
                <CardDescription className="text-base">Your personal academic companion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600">
                  Get instant assignment summaries, resource suggestions, and study tips from our AI chatbot trained on academic content.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Assignment breakdown & analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Curated learning resources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Study schedule optimization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-cyan-500 via-blue-500 to-purple-500 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)] bg-size-[250%_250%] animate-pulse"></div>
            <CardContent className="relative p-16 sm:p-20 text-center space-y-6">
              <h2 className="text-4xl font-bold">Ready to get organized?</h2>
              <p className="text-xl text-cyan-50 max-w-2xl mx-auto">
                Join thousands of students who never miss a deadline. Start using Nexus today.
              </p>
              <Button
                size="lg"
                className="bg-white text-cyan-600 hover:bg-cyan-50 text-lg px-8 py-6 mt-4"
                onClick={handleSignUpClick}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </LandingLayout>
  );
}

