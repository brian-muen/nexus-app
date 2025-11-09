import { CheckSquare, Sparkles, Timer, GaugeCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { closeLogInModal, closeSignUpModal, openSignUpModal } from '@/redux/slices/modalSlice';
import LandingLayout from '@/components/landing/LandingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TodoPage() {
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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <CheckSquare className="w-4 h-4" />
              Smart task engine
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Auto-structured to-do lists
              <span className="text-gradient"> that think like your TA.</span>
            </h1>
            <p className="text-lg text-gray-600">
              Nexus converts every assignment, announcement, and lecture note into an actionable plan. Tasks are sorted by urgency, estimated effort, and impact—so you always know what to tackle next.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-linear-to-r from-cyan-500 to-blue-500 text-white" onClick={handleSignUpClick}>
                Build my to-do list
              </Button>
              <Button size="lg" variant="outline" className="text-lg">Download sample export</Button>
            </div>
          </div>

          <div className="bg-white/85 rounded-3xl shadow-xl border border-blue-100 p-6">
            <header className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Today&apos;s focus</p>
                <h3 className="text-xl font-semibold text-gray-900">Thursday, Oct 17</h3>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">On track</span>
            </header>
            <ul className="space-y-3">
              {[
                { title: 'EECS 126 – Problem Set 5', detail: 'Deep dive: Questions 3 & 4', estimate: '1h 20m' },
                { title: 'CS 170 – Read project spec', detail: 'Annotate matching sections for team sync', estimate: '35m' },
                { title: 'Math 110 – Quiz prep', detail: 'Auto-generated flashcards ready', estimate: '45m' },
                { title: 'AI sprint review', detail: 'Meet with study group · 6:30 PM', estimate: 'Scheduled' },
              ].map(item => (
                <li key={item.title} className="rounded-2xl border border-gray-200 px-4 py-3 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.detail}</p>
                  </div>
                  <span className="text-sm text-gray-400">{item.estimate}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          <Card className="bg-white/85 backdrop-blur border-blue-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <CardTitle>AI triage that adapts</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>Assignments are scored across urgency, difficulty, and grading weight, then scheduled intelligently across your available work blocks.</p>
              <ul className="space-y-2 text-sm">
                <li>• Personalized difficulty profiles</li>
                <li>• Automatic study block suggestions</li>
                <li>• Recurring task templates</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur border-cyan-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <Timer className="w-6 h-6" />
              </div>
              <CardTitle>Workload forecasting</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>See a rolling projection of your week and let Nexus warn you before crunch time appears.</p>
              <ul className="space-y-2 text-sm">
                <li>• Effort curves & burn charts</li>
                <li>• Load balancing suggestions</li>
                <li>• Sync to calendar in one click</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur border-purple-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <GaugeCircle className="w-6 h-6" />
              </div>
              <CardTitle>Progress that motivates</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>Watch completion bars fill in real time, and get gentle nudges when streaks are at risk of breaking.</p>
              <ul className="space-y-2 text-sm">
                <li>• Daily momentum score</li>
                <li>• Accountability partner mode</li>
                <li>• Exportable weekly summaries</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Let Nexus keep the list. You just do the work.</h2>
          <p className="text-lg text-gray-600">
            Add your classes, connect your calendars, and watch an intelligent to-do list appear in minutes. Every update is synced across the team automatically.
          </p>
          <Button size="lg" className="bg-linear-to-r from-cyan-500 to-blue-500 text-white" onClick={handleSignUpClick}>
            Automate my tasks
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
