"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Bell, Shield, Users, FileCheck, Gavel } from "lucide-react";
import NoticeForm from "./sub-forms/NoticeForm";
import PersonalBondForm from "./sub-forms/PersonalBondForm";
import { SuretyBond126Form } from "./sub-forms/SuretyBondForm";
import StatementAccusedForm from "./sub-forms/statementAccussed";
import { StatementWitnessForm } from "./sub-forms/statementWitness";
import { FinalOrderForm } from "./sub-forms/FinalOrderForm";

interface FormsSectionProps {
    caseId: string;
    defendants: Array<{ _id: string; name: string }>;
    witnesses: Array<{ _id: string; name: string }>;
}

export default function FormsSection({ caseId, defendants, witnesses }: FormsSectionProps) {
    const [activeTab, setActiveTab] = useState("notice-130");

    const formTabs = [
        {
            id: "notice-130",
            label: "Notice 130",
            icon: Bell,
            component: NoticeForm,
            description: "Issue notice to accused"
        },
        {
            id: "personal-bond-125",
            label: "Personal Bond 125",
            icon: Shield,
            component: PersonalBondForm,
            description: "Personal bond order"
        },
        {
            id: "surety-bond-126",
            label: "Surety Bond 126",
            icon: Users,
            component: SuretyBond126Form,
            description: "Surety bond order"
        },
        {
            id: "statement-accused",
            label: "Accused Statement",
            icon: FileText,
            component: StatementAccusedForm,
            description: "Record accused statement"
        },
        {
            id: "statement-witness",
            label: "Witness Statement",
            icon: FileCheck,
            component: StatementWitnessForm,
            description: "Record witness statement"
        },
        {
            id: "final-order",
            label: "Final Order",
            icon: Gavel,
            component: FinalOrderForm,
            description: "Issue final order"
        }
    ];

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-transparent p-1">
                    {formTabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <tab.icon size={20} />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {formTabs.map((tab) => {
                    const FormComponent = tab.component;
                    return (
                        <TabsContent key={tab.id} value={tab.id} className="mt-20">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <tab.icon size={20} />
                                    {tab.label}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {tab.description}
                                </p>
                            </div>
                            <FormComponent
                                caseId={caseId}
                                defendants={defendants}
                                witnesses={witnesses}
                            />
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}