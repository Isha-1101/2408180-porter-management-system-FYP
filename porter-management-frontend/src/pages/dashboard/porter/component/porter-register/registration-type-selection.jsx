import { User, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const RegistrationTypeSelection = ({ selectedType, onSelect }) => {
    const types = [
        {
            id: "individual",
            title: "Individual Porter",
            description: "Register as an independent porter",
            icon: User,
        },
        {
            id: "team_member",
            title: "Team Porter",
            description: "Register as part of a team",
            icon: Users,
        },
    ];

    return (
        <Card className="border-none shadow-none">
            <CardContent className="pt-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Choose Registration Type</h2>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {types.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => onSelect(type.id)}
                            className={`
                group relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300
                hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1
                ${selectedType === type.id
                                    ? "border-primary bg-card ring-1 ring-primary shadow-md"
                                    : "border-muted bg-card"
                                }
              `}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div
                                    className={`
                  p-4 rounded-full transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground
                  ${selectedType === type.id
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground"
                                        }
                `}
                                >
                                    <type.icon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className={`font-semibold text-lg transition-colors duration-300 ${selectedType === type.id ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{type.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default RegistrationTypeSelection;
