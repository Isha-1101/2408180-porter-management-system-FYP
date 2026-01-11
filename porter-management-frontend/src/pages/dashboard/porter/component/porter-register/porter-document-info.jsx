import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, IdCard, Upload } from "lucide-react";

const DocumentInfo = ({ data, onChange }) => {
 const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange("documents", "porterLicenseDocument", file);
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* License Number */}
        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="flex items-center gap-2">
            <IdCard className="h-4 w-4" />
            License Number *
          </Label>
          <Input
            id="licenseNumber"
            value={data?.licenseNumber || ""}
            onChange={(e) => onChange("documents", "licenseNumber", e.target.value)}
            placeholder="Enter your license number"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Enter the official license number issued by authorities
          </p>
        </div>

        {/* License Document Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            License Document *
          </Label>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                id="porterLicenseDocument"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
             
              {data?.porterLicenseDocument && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Document uploaded
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a scanned copy of your license (PDF, JPG, PNG, max 5MB)
            </p>
          </div>
        </div>

        {/* Document Preview Section */}
        {data?.porterLicenseDocument && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Uploaded Document</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {data?.porterLicenseDocument.name || "license_document.pdf"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ready for verification
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentInfo;