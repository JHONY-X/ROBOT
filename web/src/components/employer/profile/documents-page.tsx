"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { FieldErrors, FormErrors } from "@/components/forms/ApiErrors";
import { normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";
import { organizationApi, OrganizationApiError, type OrganizationDocument, type OrganizationDocumentType } from "@/lib/api/services/organization";

const EMPTY_ERRORS: NormalizedApiErrors = { fieldErrors: {}, formErrors: [] };
const DOCUMENT_TYPES: { value: OrganizationDocumentType; label: string }[] = [
  { value: "business_license", label: "Business license" },
  { value: "registration_certificate", label: "Registration certificate" },
  { value: "tax_certificate", label: "Tax certificate" },
  { value: "healthcare_license", label: "Healthcare license" },
  { value: "other", label: "Other" },
];

function errorState(error: unknown): NormalizedApiErrors {
  return error instanceof OrganizationApiError
    ? error.errors
    : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "The request could not be completed."] });
}

export default function OrganizationDocumentsPage() {
  const [documents, setDocuments] = useState<OrganizationDocument[]>([]);
  const [documentType, setDocumentType] = useState<OrganizationDocumentType>("business_license");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [editingDocument, setEditingDocument] = useState<OrganizationDocument | null>(null);
  const [editDocumentType, setEditDocumentType] = useState<OrganizationDocumentType>("business_license");
  const [editDocumentFile, setEditDocumentFile] = useState<File | null>(null);
  const [viewingDocument, setViewingDocument] = useState<OrganizationDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState<number | null>(null);
  const [documentErrors, setDocumentErrors] = useState(EMPTY_ERRORS);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    organizationApi.getMine()
      .then(() => organizationApi.listDocuments())
      .then((rows) => { if (active) setDocuments(rows); })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(error instanceof OrganizationApiError && error.status === 404
          ? "Create your organization profile before uploading verification documents."
          : error instanceof Error ? error.message : "Could not load organization documents.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const uploadDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setIsUploading(true);
    setDocumentErrors(EMPTY_ERRORS);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!documentFile) throw new Error("Choose a document file to upload.");
      if (documentFile.size > 10 * 1024 * 1024) throw new Error("Documents must be 10 MB or smaller.");
      const formData = new FormData();
      formData.append("document_type", documentType);
      formData.append("document_file", documentFile);
      const created = await organizationApi.createDocument(formData);
      setDocuments((rows) => [...rows, created]);
      setDocumentFile(null);
      formElement.reset();
      setSuccessMessage("Organization document uploaded and sent for verification.");
    } catch (error) { setDocumentErrors(errorState(error)); }
    finally { setIsUploading(false); }
  };

  const loadDocument = async (id: number) => {
    setBusyDocumentId(id);
    setDocumentErrors(EMPTY_ERRORS);
    try { setViewingDocument(await organizationApi.getDocument(id)); }
    catch (error) { setDocumentErrors(errorState(error)); }
    finally { setBusyDocumentId(null); }
  };

  const beginDocumentEdit = (document: OrganizationDocument) => {
    setEditingDocument(document);
    setEditDocumentType(document.document_type);
    setEditDocumentFile(null);
    setDocumentErrors(EMPTY_ERRORS);
  };

  const updateDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingDocument) return;
    setBusyDocumentId(editingDocument.id);
    setDocumentErrors(EMPTY_ERRORS);
    setErrorMessage("");
    try {
      if (editDocumentFile && editDocumentFile.size > 10 * 1024 * 1024) throw new Error("Documents must be 10 MB or smaller.");
      const formData = new FormData();
      formData.append("document_type", editDocumentType);
      if (editDocumentFile) formData.append("document_file", editDocumentFile);
      const updated = await organizationApi.updateDocument(editingDocument.id, formData);
      setDocuments((rows) => rows.map((item) => item.id === updated.id ? updated : item));
      setEditingDocument(null);
      setSuccessMessage("Document updated. Its verification status has returned to pending.");
    } catch (error) { setDocumentErrors(errorState(error)); }
    finally { setBusyDocumentId(null); }
  };

  const deleteDocument = async (document: OrganizationDocument) => {
    if (!window.confirm(`Delete the ${document.document_type.replaceAll("_", " ")} document?`)) return;
    setBusyDocumentId(document.id);
    setDocumentErrors(EMPTY_ERRORS);
    setErrorMessage("");
    try {
      await organizationApi.deleteDocument(document.id);
      setDocuments((rows) => rows.filter((item) => item.id !== document.id));
      if (viewingDocument?.id === document.id) setViewingDocument(null);
      if (editingDocument?.id === document.id) setEditingDocument(null);
      setSuccessMessage("Organization document deleted.");
    } catch (error) { setDocumentErrors(errorState(error)); }
    finally { setBusyDocumentId(null); }
  };

  return (
    <DashboardLayout role="employer">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <Link href="/employer/profile" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline"><ArrowLeft className="h-4 w-4" />Back to organization profile</Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><FileText className="h-6 w-6 text-primary-700" />Organization documents</h1>
          <p className="mt-1 text-sm text-slate-600">Upload and manage the documents required for organization verification. PDF, JPG, JPEG, and PNG files up to 10 MB are accepted.</p>
        </header>
        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {successMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</p>}

        {isLoading ? <p role="status" className="py-8 text-sm text-slate-600">Loading organization documents...</p> : <>
          <form onSubmit={uploadDocument} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 sm:col-span-2">Upload a verification document</h2>
            <label className="text-sm font-medium text-slate-700">Document type<select required value={documentType} onChange={(event) => setDocumentType(event.target.value as OrganizationDocumentType)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">{DOCUMENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><FieldErrors errors={documentErrors} field="document_type" /></label>
            <label className="text-sm font-medium text-slate-700">Document file<input required type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full rounded-xl border border-slate-300 p-2" /><FieldErrors errors={documentErrors} field="document_file" /></label>
            <FormErrors errors={documentErrors} />
            <Button type="submit" isLoading={isUploading} disabled={isUploading}>Upload document</Button>
          </form>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">Uploaded documents</h2>
            {documents.length ? <div className="divide-y divide-slate-100">{documents.map((document) => <article key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium capitalize text-slate-900">{document.document_type.replaceAll("_", " ")}</p><p className="mt-1 text-xs capitalize text-slate-500">Status: {document.verification_status} · Added {new Date(document.created_at).toLocaleDateString()}</p></div><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" isLoading={busyDocumentId === document.id} onClick={() => loadDocument(document.id)}>Details</Button><Button type="button" size="sm" variant="outline" onClick={() => beginDocumentEdit(document)}>Edit</Button><Button type="button" size="sm" variant="danger" disabled={busyDocumentId !== null} onClick={() => deleteDocument(document)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button></div></article>)}</div> : <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No documents uploaded yet.</p>}
            {viewingDocument && <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm"><div className="flex justify-between gap-3"><h3 className="font-semibold capitalize">{viewingDocument.document_type.replaceAll("_", " ")}</h3><button type="button" onClick={() => setViewingDocument(null)} className="text-primary-800 underline">Close</button></div><p className="mt-1 capitalize">Verification: {viewingDocument.verification_status}</p><a href={viewingDocument.document_file} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold text-primary-800 hover:underline">Open document file</a></div>}
            {editingDocument && <form onSubmit={updateDocument} className="space-y-3 rounded-xl border border-slate-200 p-4"><h3 className="font-semibold text-slate-900">Update document</h3><label className="block text-sm font-medium text-slate-700">Document type<select value={editDocumentType} onChange={(event) => setEditDocumentType(event.target.value as OrganizationDocumentType)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">{DOCUMENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Replace file (optional)<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => setEditDocumentFile(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full rounded-xl border border-slate-300 p-2" /></label><FormErrors errors={documentErrors} /><div className="flex gap-2"><Button type="submit" size="sm" isLoading={busyDocumentId === editingDocument.id} disabled={busyDocumentId !== null}>Save document</Button><Button type="button" size="sm" variant="outline" onClick={() => setEditingDocument(null)}>Cancel</Button></div></form>}
            <FormErrors errors={documentErrors} />
          </section>
        </>}
      </div>
    </DashboardLayout>
  );
}
