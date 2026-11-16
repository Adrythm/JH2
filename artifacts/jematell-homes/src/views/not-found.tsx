import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

// The old <Seo title="Page Not Found" noindex /> sink is gone: under the App
// Router the app/not-found.tsx wrapper owns the route's metadata (noindex).
export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            This page has moved or no longer exists. Try{" "}
            <Link href="/custom-homes" className="underline">custom homes</Link>,{" "}
            <Link href="/build-on-your-lot" className="underline">build on your lot</Link>,{" "}
            <Link href="/faq" className="underline">our FAQ</Link> or{" "}
            <Link href="/contact" className="underline">contact us</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
