"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Trash2, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  MSG_PDF_NOT_READY,
  MSG_RESUME_DELETE_FAILED,
  MSG_CONFIRM_DELETE_RESUME,
} from "@/lib/messages";
import { MAX_RESUMES } from "@/lib/constants";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type ResumeDoc = Doc<"resumes">;

function ResumeCard({
  resume,
  onEdit,
  onDelete,
  showToast,
}: {
  resume: ResumeDoc;
  onEdit: () => void;
  onDelete: () => void;
  showToast: (msg: string, type?: "error" | "success") => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pdfUrl = useQuery(api.resumes.getResumePdfUrl, {
    resumeId: resume._id,
  });

  const handleDownload = () => {
    if (!pdfUrl) {
      showToast(MSG_PDF_NOT_READY);
      return;
    }

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${resume.title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch {
      // Error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <FileText className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground truncate font-semibold">{resume.title}</h3>
              <p className="text-muted-foreground text-xs">{resume.fields.fullName}</p>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground mb-4 space-y-1 text-sm">
          <p>Email: {resume.fields.email}</p>
          <p>Phone: {resume.fields.phone}</p>
          {resume.fields.location && <p>Location: {resume.fields.location}</p>}
          <p className="pt-2 text-xs">Updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1 cursor-pointer"
            disabled={!resume.pdfStorageId}
          >
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} className="cursor-pointer" aria-label="Edit resume">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive cursor-pointer"
            aria-label="Delete resume"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Resume"
        description={MSG_CONFIRM_DELETE_RESUME}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}

export function ResumesClient() {
  const router = useRouter();
  const resumes = useQuery(api.resumes.listResumes) as ResumeDoc[] | undefined;
  const deleteResume = useMutation(api.resumes.deleteResume);
  const { toast, showToast } = useToast();

  const handleDelete = async (resumeId: Id<"resumes">) => {
    try {
      await deleteResume({ resumeId });
    } catch {
      showToast(MSG_RESUME_DELETE_FAILED);
    }
  };

  if (!resumes) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading resumes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {resumes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onEdit={() => router.push(`/resumes/${resume._id}/edit`)}
              onDelete={() => handleDelete(resume._id)}
              showToast={showToast}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12">
          <div className="text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No resumes yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create your first resume using the &quot;Add Resume&quot; button above
            </p>
          </div>
        </div>
      )}

      {resumes.length >= MAX_RESUMES && (
        <div className="rounded-lg border border-amber-900 bg-amber-950/20 p-4">
          <p className="text-sm text-amber-200">
            You&apos;ve reached the maximum of {MAX_RESUMES} resumes. Please delete a resume to
            create a new one.
          </p>
        </div>
      )}
    </div>
  );
}
