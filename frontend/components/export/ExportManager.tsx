"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  FileText,
  Share2,
  QrCode,
  Mail,
  Link,
  Copy,
  CheckCircle,
  Loader2,
  FileSpreadsheet,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import jsPDF from "jspdf"
import * as XLSX from "xlsx"

interface ExportData {
  id: string
  title: string
  description: string
  findings: Array<{
    id: string
    title: string
    severity: string
    description: string
    file: string
    line: number
  }>
  summary: {
    total_findings: number
    high_severity: number
    medium_severity: number
    low_severity: number
  }
  metadata: {
    contract_name: string
    analysis_time: string
    tools_used: string[]
  }
}

interface ExportManagerProps {
  data: ExportData
  onShare?: (shareUrl: string) => void
}

export const ExportManager: React.FC<ExportManagerProps> = ({ data, onShare }) => {
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "json">("pdf")
  const [exportOptions, setExportOptions] = useState({
    includeSummary: true,
    includeFindings: true,
    includeMetadata: true,
    includeCharts: false,
  })
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [shareEmail, setShareEmail] = useState("")
  const [shareMessage, setShareMessage] = useState("")
  const [exporting, setExporting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const generatePDF = async () => {
    const pdf = new jsPDF()
    let yPosition = 20

    // 标题
    pdf.setFontSize(20)
    pdf.text(data.title, 20, yPosition)
    yPosition += 15

    // 摘要
    if (exportOptions.includeSummary) {
      pdf.setFontSize(16)
      pdf.text("分析摘要", 20, yPosition)
      yPosition += 10

      pdf.setFontSize(12)
      pdf.text(`总计发现: ${data.summary.total_findings}`, 20, yPosition)
      yPosition += 7
      pdf.text(`高风险: ${data.summary.high_severity}`, 20, yPosition)
      yPosition += 7
      pdf.text(`中风险: ${data.summary.medium_severity}`, 20, yPosition)
      yPosition += 7
      pdf.text(`低风险: ${data.summary.low_severity}`, 20, yPosition)
      yPosition += 15
    }

    // 元数据
    if (exportOptions.includeMetadata) {
      pdf.setFontSize(16)
      pdf.text("分析信息", 20, yPosition)
      yPosition += 10

      pdf.setFontSize(12)
      pdf.text(`合约名称: ${data.metadata.contract_name}`, 20, yPosition)
      yPosition += 7
      pdf.text(`分析时间: ${data.metadata.analysis_time}`, 20, yPosition)
      yPosition += 7
      pdf.text(`使用工具: ${data.metadata.tools_used.join(", ")}`, 20, yPosition)
      yPosition += 15
    }

    // 发现的问题
    if (exportOptions.includeFindings) {
      pdf.setFontSize(16)
      pdf.text("发现的问题", 20, yPosition)
      yPosition += 10

      data.findings.forEach((finding, index) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(14)
        pdf.text(`${index + 1}. ${finding.title}`, 20, yPosition)
        yPosition += 8

        pdf.setFontSize(10)
        pdf.text(`风险等级: ${finding.severity}`, 25, yPosition)
        yPosition += 6
        pdf.text(`文件: ${finding.file}:${finding.line}`, 25, yPosition)
        yPosition += 6

        // 描述（需要处理长文本）
        const lines = pdf.splitTextToSize(finding.description, 160)
        pdf.text(lines, 25, yPosition)
        yPosition += lines.length * 5 + 5
      })
    }

    return pdf
  }

  const generateExcel = () => {
    const workbook = XLSX.utils.book_new()

    // 摘要工作表
    if (exportOptions.includeSummary) {
      const summaryData = [
        ["项目", "数量"],
        ["总计发现", data.summary.total_findings],
        ["高风险", data.summary.high_severity],
        ["中风险", data.summary.medium_severity],
        ["低风险", data.summary.low_severity],
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, "摘要")
    }

    // 发现问题工作表
    if (exportOptions.includeFindings) {
      const findingsData = [
        ["ID", "标题", "风险等级", "文件", "行号", "描述"],
        ...data.findings.map((finding) => [
          finding.id,
          finding.title,
          finding.severity,
          finding.file,
          finding.line,
          finding.description,
        ]),
      ]
      const findingsSheet = XLSX.utils.aoa_to_sheet(findingsData)
      XLSX.utils.book_append_sheet(workbook, findingsSheet, "发现问题")
    }

    // 元数据工作表
    if (exportOptions.includeMetadata) {
      const metadataData = [
        ["属性", "值"],
        ["合约名称", data.metadata.contract_name],
        ["分析时间", data.metadata.analysis_time],
        ["使用工具", data.metadata.tools_used.join(", ")],
      ]
      const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData)
      XLSX.utils.book_append_sheet(workbook, metadataSheet, "元数据")
    }

    return workbook
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      switch (exportFormat) {
        case "pdf":
          const pdf = await generatePDF()
          pdf.save(`${data.metadata.contract_name}_analysis_report.pdf`)
          break

        case "excel":
          const workbook = generateExcel()
          XLSX.writeFile(workbook, `${data.metadata.contract_name}_analysis_report.xlsx`)
          break

        case "json":
          const jsonData = {
            ...data,
            exportOptions,
            exportTime: new Date().toISOString(),
          }
          const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${data.metadata.contract_name}_analysis_report.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          break
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setExporting(false)
    }
  }

  const generateShareUrl = async () => {
    setSharing(true)
    try {
      // 模拟生成分享链接
      const shareId = Math.random().toString(36).substr(2, 9)
      const url = `${window.location.origin}/shared/${shareId}`
      setShareUrl(url)
      onShare?.(url)
    } catch (error) {
      console.error("Share failed:", error)
    } finally {
      setSharing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const sendEmail = () => {
    const subject = encodeURIComponent(`智能合约分析报告 - ${data.metadata.contract_name}`)
    const body = encodeURIComponent(`
${shareMessage}

分析报告链接: ${shareUrl}

分析摘要:
- 总计发现: ${data.summary.total_findings}
- 高风险: ${data.summary.high_severity}
- 中风险: ${data.summary.medium_severity}
- 低风险: ${data.summary.low_severity}

此链接将在7天后过期。
    `)
    window.open(`mailto:${shareEmail}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="space-y-6">
      {/* 导出设置 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>导出报告</span>
          </CardTitle>
          <CardDescription className="text-gray-400">选择导出格式和包含的内容</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 block">导出格式</label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="pdf">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>PDF 报告</span>
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel 表格</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>JSON 数据</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white font-medium mb-3 block">包含内容</label>
            <div className="space-y-2">
              {Object.entries(exportOptions).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, [key]: !!checked }))}
                  />
                  <label htmlFor={key} className="text-sm text-gray-300 cursor-pointer">
                    {key === "includeSummary" && "分析摘要"}
                    {key === "includeFindings" && "发现问题"}
                    {key === "includeMetadata" && "元数据信息"}
                    {key === "includeCharts" && "图表统计"}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleExport} disabled={exporting} className="w-full bg-blue-600 hover:bg-blue-700">
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 分享功能 */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>分享报告</span>
          </CardTitle>
          <CardDescription className="text-gray-400">生成分享链接或二维码</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={generateShareUrl} disabled={sharing} className="flex-1 bg-green-600 hover:bg-green-700">
              {sharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  生成链接
                </>
              )}
            </Button>
            <Button
              onClick={() => setQrDialogOpen(true)}
              disabled={!shareUrl}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              <QrCode className="w-4 h-4 mr-2" />
              二维码
            </Button>
            <Button
              onClick={() => setShareDialogOpen(true)}
              disabled={!shareUrl}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              <Mail className="w-4 h-4 mr-2" />
              邮件
            </Button>
          </div>

          {shareUrl && (
            <div className="p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate flex-1 mr-2">{shareUrl}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(shareUrl)}
                  className="text-gray-400 hover:text-white"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs text-green-400 border-green-500">
                  7天有效
                </Badge>
                <Badge variant="outline" className="text-xs text-blue-400 border-blue-500">
                  只读访问
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 邮件分享对话框 */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">邮件分享</DialogTitle>
            <DialogDescription className="text-gray-400">通过邮件分享分析报告</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white font-medium mb-2 block">收件人邮箱</label>
              <Input
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="example@email.com"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-white font-medium mb-2 block">附加消息</label>
              <Textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="添加一些说明..."
                className="bg-gray-700/50 border-gray-600 text-white"
                rows={3}
              />
            </div>
            <Button onClick={sendEmail} disabled={!shareEmail} className="w-full bg-blue-600 hover:bg-blue-700">
              <Mail className="w-4 h-4 mr-2" />
              发送邮件
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 二维码对话框 */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">二维码分享</DialogTitle>
            <DialogDescription className="text-gray-400">扫描二维码访问分析报告</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {shareUrl && (
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG value={shareUrl} size={200} />
              </div>
            )}
            <p className="text-sm text-gray-400 text-center">使用手机扫描二维码即可访问报告</p>
            <Button
              onClick={() => copyToClipboard(shareUrl)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              复制链接
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
