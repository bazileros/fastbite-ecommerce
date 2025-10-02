'use client';

import {
  useId,
  useState,
} from 'react';

import {
  Download,
  FileText,
  Filter,
  Mail,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  type ReportExport as ReportExportType,
  ReportExportSchema,
} from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';

interface ReportFilters {
  dateRange: string;
  reportType: string;
  format: string;
}

interface ReportExportProps {
  onExport?: (type: 'email' | 'download', format: string, filters: ReportFilters) => void;
}

export function ReportExport({ onExport }: ReportExportProps) {
  const { toast } = useToast();
  const emailId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState<'email' | 'download'>('download');
  const [isExporting, setIsExporting] = useState(false);

  const reportForm = useForm<ReportExportType>({
    resolver: zodResolver(ReportExportSchema),
    defaultValues: {
      format: 'pdf',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      includeCharts: true,
      email: '',
    },
  });

  const handleExport = async (data: ReportExportType) => {
    console.log('Report export data:', data);

    if (exportType === 'email' && !data.email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address for the report.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (exportType === 'email') {
        toast({
          title: "Report Sent!",
          description: `Report has been sent to ${data.email}`,
        });
      } else {
        toast({
          title: "Report Downloaded!",
          description: `Your report has been downloaded as ${data.format.toUpperCase()}`,
        });
      }

      setIsOpen(false);
      reportForm.reset();
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Report
          </DialogTitle>
          <DialogDescription>
            Generate and export detailed reports for your business analytics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type */}
          <div className="space-y-3">
            <Label className="font-medium text-base">Export Method</Label>
            <div className="gap-3 grid grid-cols-2">
              <Button
                type="button"
                variant={exportType === 'download' ? 'default' : 'outline'}
                onClick={() => setExportType('download')}
                className="flex items-center gap-2 p-4 h-auto"
              >
                <Download className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Download</div>
                  <div className="opacity-70 text-xs">Save to device</div>
                </div>
              </Button>
              <Button
                type="button"
                variant={exportType === 'email' ? 'default' : 'outline'}
                onClick={() => setExportType('email')}
                className="flex items-center gap-2 p-4 h-auto"
              >
                <Mail className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Email</div>
                  <div className="opacity-70 text-xs">Send via email</div>
                </div>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Report Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value="sales" onValueChange={() => {}}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="orders">Orders Report</SelectItem>
                  <SelectItem value="customers">Customer Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value="last-30-days" onValueChange={() => {}}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select
                value={reportForm.watch('format')}
                onValueChange={(value: 'pdf' | 'csv' | 'excel') => reportForm.setValue('format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportType === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id={emailId}
                  type="email"
                  placeholder="Enter email address"
                  {...reportForm.register('email')}
                  required
                />
                {reportForm.formState.errors.email && (
                  <p className="text-destructive text-sm">{reportForm.formState.errors.email.message}</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Export Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
                <Filter className="w-4 h-4" />
                Export Summary
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Period:</span>
                  <span className="font-medium">{reportForm.watch('dateRange.start')} to {reportForm.watch('dateRange.end')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium uppercase">{reportForm.watch('format')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-medium capitalize">{exportType}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={reportForm.handleSubmit(handleExport)}
              disabled={isExporting || reportForm.formState.isSubmitting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <div className="mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
                  {exportType === 'email' ? 'Sending...' : 'Downloading...'}
                </>
              ) : (
                <>
                  {exportType === 'email' ? <Mail className="mr-2 w-4 h-4" /> : <Download className="mr-2 w-4 h-4" />}
                  {exportType === 'email' ? 'Send Report' : 'Download Report'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}