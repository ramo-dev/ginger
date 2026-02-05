import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AgentSettings() {
    const [modelPropmt, setModelPropmt] = useState<string | null>(null);
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={modelPropmt || ""}
                    onChange={(e) => setModelPropmt(e.target.value)}
                    placeholder="You can define model behaviour and how it responds"
                />
            </CardContent>
        </Card>
    )
}
