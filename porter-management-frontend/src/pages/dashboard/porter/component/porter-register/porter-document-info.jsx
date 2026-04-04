import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, IdCard, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

const validate = (data) => {
  return {
    licenseNumber: !data?.licenseNumber || data.licenseNumber.trim() === ""
      ? "Enter your license number"
      : /^[A-Za-z0-9-]+$/.test(data.licenseNumber)
      ? ""
      : "Enter a valid alphanumeric license number",
    porterLicenseDocument: !data?.porterLicenseDocument
      ? "Please upload your license document"
      : data.porterLicenseDocument instanceof File
      ? /\.(jpg|jpeg|png|pdf)$/i.test(data.porterLicenseDocument.name)
        ? ""
        : "Please upload a valid document (PDF, JPG, PNG)"
      : "",
  };
};

export const isDocumentInfoValid = (data) => {
  const errors = validate(data);
  return Object.values(errors).every((e) => e === "");
};

// ── Helper: field border class ────────────────────────────────────────────────
const fieldClass = (touched, error, value) => {
  if (!touched) return "border-gray-300 focus:border-primary focus:ring-primary";
  if (error)    return "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30";
  return "border-gray-300 focus:border-primary focus:ring-primary";
};

// ── FieldMsg: shows error or success icon underneath ─────────────────────────
const FieldMsg = ({ touched, error, value }) => {
  if (!touched) return null;
  if (error)
    return (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    );
  return null;
};

// ── UploadBox: dashed upload area with validation colour ──────────────────────
const UploadBox = ({ touched, error, value, children }) => {
  const border = !touched
    ? "border-gray-300"
    : error
    ? "border-red-400 bg-red-50/20"
    : "border-gray-300 hover:border-primary";

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden group hover:border-primary transition-colors ${border}`}
    >
      {children}
    </div>
  );
};

const DocumentInfo = ({ data, onChange }) => {
  const [touched, setTouched] = useState({
    licenseNumber: false,
    porterLicenseDocument: false,
  });

  const errors = validate(data);

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    touch("porterLicenseDocument");
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
            onChange={(e) => {
              touch("licenseNumber");
              const val = e.target.value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase(); // Allow alphanumeric and hyphen, and convert to uppercase
              onChange("documents", "licenseNumber", val);
            }}
            onBlur={() => touch("licenseNumber")}
            placeholder="Enter your license number"
            className={`w-full transition-colors ${fieldClass(touched.licenseNumber, errors.licenseNumber, data?.licenseNumber)}`}
          />
          <FieldMsg touched={touched.licenseNumber} error={errors.licenseNumber} value={data?.licenseNumber} />
        </div>

        {/* License Document Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            License Document *
          </Label>
          
          <Label
            htmlFor="porterLicenseDocument"
            className="cursor-pointer block"
            onClick={() => touch("porterLicenseDocument")}
          >
            <UploadBox touched={touched.porterLicenseDocument} error={errors.porterLicenseDocument} value={data?.porterLicenseDocument}>
              {data?.porterLicenseDocument ? (
                <div className="flex flex-col items-center">
                   <FileText className="h-10 w-10 text-primary mb-2" />
                   <p className="text-sm font-medium text-center">
                     {data.porterLicenseDocument.name || "Document Uploaded"}
                   </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-xs">Upload License Document (PDF, JPG, PNG)</span>
                </div>
              )}
            </UploadBox>
          </Label>
          
          <Input
            id="porterLicenseDocument"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
          <FieldMsg touched={touched.porterLicenseDocument} error={errors.porterLicenseDocument} value={data?.porterLicenseDocument} />
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