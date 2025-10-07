"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Trash2, Plus, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { AddResumeDialog } from "./add-resume-dialog";
import { EditResumeDialog } from "./edit-resume-dialog";

type ResumeDoc = Doc<"resumes">;

function ResumeCard({
  resume,
  onEdit,
  onDelete,
}: {
  resume: ResumeDoc;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const pdfUrl = useQuery(api.resumes.getResumePdfUrl, {
    resumeId: resume._id,
  });

  const handleDownload = () => {
    if (!pdfUrl) {
      alert("PDF not generated yet. Please try again later.");
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
    if (!confirm("Are you sure you want to delete this resume?")) return;

    setIsDeleting(true);
    try {
      await onDelete();
      // Success - isDeleting will be cleared when component unmounts
      // or by the finally block if there's an error
    } catch (error) {
      // Error already handled by parent handleDelete
      // Just ensure we reset the deleting state
    } finally {
      setIsDeleting(false);
    }
  };

  return (
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
        <Button variant="outline" size="sm" onClick={onEdit} className="cursor-pointer">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export function ResumesClient() {
  const resumes = useQuery(api.resumes.listResumes) as ResumeDoc[] | undefined;
  const deleteResume = useMutation(api.resumes.deleteResume);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<ResumeDoc | null>(null);

  const handleDelete = async (resumeId: Id<"resumes">) => {
    try {
      await deleteResume({ resumeId });
    } catch (error: unknown) {
      console.error("Failed to delete resume:", error);
      alert(
        "Failed to delete resume. Please try again or contact support if the problem persists.",
      );
      // Rethrow to let the caller know deletion failed
      throw error;
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
      {/* Resumes Grid */}
      {resumes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onEdit={() => setEditingResume(resume)}
              onDelete={() => handleDelete(resume._id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12">
          <div className="text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No resumes yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create your first resume to get started
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create Resume
            </Button>
          </div>
        </div>
      )}

      {/* Add Resume Button (when resumes exist) */}
      {resumes.length > 0 && resumes.length < 5 && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => setIsAddDialogOpen(true)}
            className="min-w-[200px] cursor-pointer"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Resume
          </Button>
        </div>
      )}

      {/* Limit reached message */}
      {resumes.length >= 5 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            You&apos;ve reached the maximum of 5 resumes. Please delete a resume to create a new
            one.
          </p>
        </div>
      )}

      {/* Dialogs */}
      <AddResumeDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {editingResume && (
        <EditResumeDialog
          resume={editingResume}
          open={!!editingResume}
          onOpenChange={(open: boolean) => !open && setEditingResume(null)}
        />
      )}
    </div>
  );
}
