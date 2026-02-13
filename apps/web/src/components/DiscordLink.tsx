"use client";

import { usePostHog } from "posthog-js/react";

export function DiscordLink() {
    const posthog = usePostHog();

    const handleClick = () => {
        posthog?.capture('discord_link_clicked', {
            location: 'hero_section'
        });
    };

    return (
        <a
            href="https://discord.gg/u5ANEpAAhT"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-tech-purple transition-colors"
        >
            <span className="w-1.5 h-1.5 rounded-full bg-tech-purple animate-pulse" />
            Join the Community on Discord
        </a>
    );
}
