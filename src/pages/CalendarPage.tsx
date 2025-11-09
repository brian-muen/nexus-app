import { Calendar, Clock, Link2, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { closeLogInModal, openSignUpModal } from '@/redux/slices/modalSlice';
import LandingLayout from '@/components/landing/LandingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalendarPage() {
  const dispatch = useDispatch<AppDispatch>();

  const handleSignUpClick = () => {
    dispatch(closeLogInModal());
    dispatch(openSignUpModal());
  };

  return (
    <LandingLayout>
      <section className="px-4 sm:px-6 lg:px-8 py-24 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              Calendar Intelligence
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Every due date, lecture, and reminder.
              <span className="text-gradient"> All in one timeline.</span>
            </h1>
            <p className="text-lg text-gray-600">
              Nexus automatically syncs Canvas, Gradescope, and your personal calendars to build the most accurate schedule you&apos;ve ever had.
              Conflict detection keeps you ahead, while smart reminders arrive exactly when you need them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-linear-to-r from-cyan-500 to-blue-500 text-white" onClick={handleSignUpClick}>
                Create my calendar
              </Button>
              <Button size="lg" variant="outline" className="text-lg">See a sample week</Button>
            </div>
          </div>
          <div className="bg-white/80 rounded-3xl shadow-xl border border-cyan-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Week at a glance</h3>
              <span className="text-sm text-gray-500">Synced 3 min ago</span>
            </div>
            <div className="space-y-3">
              {[
                { title: 'CS 170 – Homework 6', time: 'Due Thu · 11:59 PM', accent: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/40' },
                { title: 'Math 54 – Discussion', time: 'Fri · 9:00 AM', accent: 'bg-blue-500/10 text-blue-700 border-blue-500/40' },
                { title: 'EECS 16B – Lab Checkoff', time: 'Fri · 3:00 PM', accent: 'bg-purple-500/10 text-purple-700 border-purple-500/40' },
                { title: 'AI Study Sprint', time: 'Sat · Smart reminder added', accent: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/40' },
              ].map(item => (
                <div key={item.title} className={`rounded-2xl border px-4 py-3 ${item.accent}`}>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm opacity-80">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          <Card className="bg-white/85 backdrop-blur border-cyan-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <Link2 className="w-6 h-6" />
              </div>
              <CardTitle>Deep integrations</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>Canvas, Gradescope, Google Calendar, Outlook, iCal—connect once and Nexus keeps everything in near real-time sync.</p>
              <ul className="space-y-2 text-sm">
                <li>• Automatic class schedule detection</li>
                <li>• Assignment metadata enrichment</li>
                <li>• Bi-directional calendar updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur border-blue-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <CardTitle>Plan around reality</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>Nexus analyses assignment load, lecture cadence, and extracurriculars to suggest ideal work blocks.</p>
              <ul className="space-y-2 text-sm">
                <li>• Smart focus windows</li>
                <li>• Automatic commute buffers</li>
                <li>• AI-generated cram plans</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur border-purple-100">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <CardTitle>Never miss a deadline</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-3">
              <p>Priority alerts surface only when something truly needs your attention—no more noisy notification flood.</p>
              <ul className="space-y-2 text-sm">
                <li>• Conflict + overload detection</li>
                <li>• Priority-based reminders</li>
                <li>• Slack / SMS / email delivery</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Built for students who juggle everything.</h2>
          <p className="text-lg text-gray-600">
            From labs to late-night hackathons, Nexus keeps your calendar honest. Sign up in under two minutes and let us pull your next semester together for you.
          </p>
          <Button size="lg" className="bg-linear-to-r from-cyan-500 to-blue-500 text-white" onClick={handleSignUpClick}>
            Start syncing
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
