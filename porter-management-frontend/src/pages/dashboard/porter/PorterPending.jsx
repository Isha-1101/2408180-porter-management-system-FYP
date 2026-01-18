import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, RefreshCw, Mail, Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router";
import PageLayout from "@/components/common/PageLayout.jsx";
import { usePorter } from "../../../hooks/porter/use-porter";

const PorterPending = () => {
  const navigate = useNavigate();
  const { porter } = usePorter();
  const pendingDetails = {
    applicationId: "POR-2024-00123",
    estimatedTime: "24-48 hours",
    contactEmail: "bhattaisha33@gmail.com",
  };
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:${pendingDetails.contactEmail}`;
  };

  const handleReturnHome = () => {
    navigate("/dashboard");
  };

  return (
    <PageLayout
      className="space-y-4"
      title="Porter Application Status"
      description="Your porter application is currently under review"
    >
      <div className="max-w-screen mx-auto">
        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Status Card */}
          <div className="md:col-span-2">
            <div className=" border-gray-200 bg-background p-2 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        Pending Approval
                      </CardTitle>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-amber-700 border-amber-200 bg-amber-50"
                  >
                    <Clock className="mr-2 h-3 w-3" />
                    Under Review
                  </Badge>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Status Message */}
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">
                      Awaiting Admin Approval
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Your porter status is currently pending administrative
                      approval. Our team is reviewing your application and will
                      notify you once a decision has been made.
                    </AlertDescription>
                  </Alert>

                  {/* Next Steps */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      What happens next?
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                        <span>
                          Administrator will review your application details
                        </span>
                      </li>
                      {/* <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                        <span>
                          You'll receive an email notification once approved
                        </span>
                      </li> */}
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                        <span>
                          Expected decision time: {pendingDetails.estimatedTime}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Check Status Update
                </Button>
                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>
                <Button
                  onClick={handleReturnHome}
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <Home className="h-4 w-4" />
                  Return to Home
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  If you have questions about your application or need to
                  provide additional information:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Support Email:</span>
                    <span className="font-medium">
                      {pendingDetails.contactEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Response Time:</span>
                    <span className="font-medium">Within 24 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PorterPending;
