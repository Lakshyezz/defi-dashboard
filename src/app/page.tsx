import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Key, User, Lock, Wallet } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">DeFi Dashboard</h1>
          <p className="text-xl text-slate-600 mb-8">
            Explore lending, liquid staking, and yield aggregator pools
          </p>
          
          <Link href={"/dashboard"}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              Go To Dashboard 
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>


        {/* Login Credentials Card */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 text-xl">
              <Key className="h-6 w-6" />
              Demo Login Credentials
            </CardTitle>
            <p className="text-green-700">Use these credentials to unlock Yield Aggregator pools</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Username</span>
                </div>
                <code className="bg-green-100 px-3 py-2 rounded font-mono text-green-800 font-bold">
                  ArcticFox
                </code>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Password</span>
                </div>
                <code className="bg-green-100 px-3 py-2 rounded font-mono text-green-800 font-bold">
                  arcticfox24
                </code>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                <li>If you have MetaMask installed, you can connect your wallet directly</li>
                <li>If MetaMask is not available, use the login form with credentials above</li>
                <li>Once authenticated, Yield Aggregator pools will be unlocked</li>
                <li>Click on any pool to see detailed historical APY charts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>Built with DeFiLlama APIs • Next.js • Tailwind CSS • shadcn/ui</p>
        </div>
      </div>
    </div>
  );
}