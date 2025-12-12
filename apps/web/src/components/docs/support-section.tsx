"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SupportSection() {
    return (
        <section className="pt-8 border-t border-white/10 mt-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Support & Community</h2>
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-[#111] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Github className="h-5 w-5" />
                            Report Issues
                        </CardTitle>
                        <CardDescription className="text-white/60">
                            Found a bug or have a feature request?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-white/60 mb-4">
                            Open an issue on our GitHub repository to get help from the team and community.
                        </p>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white" asChild>
                            <Link href="https://github.com/byronwade/beam/issues" target="_blank">
                                Open GitHub Issue
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-[#111] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Documentation</CardTitle>
                        <CardDescription className="text-white/60">
                            Help us improve our guides.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-white/60 mb-4">
                            This documentation is open source. Feel free to contribute updates or fixes.
                        </p>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white" asChild>
                            <Link href="https://github.com/byronwade/beam/tree/main/apps/web/src/app/docs" target="_blank">
                                Edit on GitHub
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
