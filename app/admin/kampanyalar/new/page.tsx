import { CampaignBuilder } from "@/components/admin/campaign-builder/CampaignBuilder";

export const metadata = { title: "Yeni Kampanya | Admin" };

export default function NewCampaignPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Yeni Kampanya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Sol panelden koşul ve aksiyon sürükleyerek kampanya oluşturun</p>
      </div>
      <CampaignBuilder />
    </div>
  );
}
