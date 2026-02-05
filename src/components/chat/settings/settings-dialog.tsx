'use client'

import {
  RiBrainAi3Line,
  RiEqualizer2Line,
  RiGitMergeLine,
  RiSettings3Line,
  RiSignalTowerLine,
} from '@remixicon/react'
import { useState } from 'react'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChangelogSettings } from './changelog-settings'
import { GeneralSettings } from './general-settings'
import { ModelSettings } from './model-settings'
import { ProviderSettings } from './provider-settings'

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <TooltipIconButton
          tooltip="Settings"
          side="bottom"
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-xl hover:bg-muted transition-all active:scale-95"
        >
          <RiEqualizer2Line className="size-5" />
        </TooltipIconButton>
      </DialogTrigger>
      <DialogContent className="min-w-5xl h-[600px] rounded-2xl p-4 gap-0 overflow-hidden flex flex-row">
        {/* Sidebar */}
        <div className="w-56 bg-muted/10 dark:bg-transparent flex flex-col">
          <div className="p-4">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <RiEqualizer2Line className="size-4" />
              Settings
            </h2>
          </div>
          <div className="flex-1 py-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
              className="h-full"
            >
              <TabsList className="flex flex-col h-auto bg-transparent p-2 gap-2 w-full justify-start">
                {[
                  {
                    value: 'general',
                    label: 'General',
                    icon: (
                      <RiSettings3Line className="size-4 mr-2 opacity-70" />
                    ),
                  },
                  {
                    value: 'providers',
                    label: 'Providers',
                    icon: (
                      <RiSignalTowerLine className="size-4 mr-2 opacity-70" />
                    ),
                  },
                  {
                    value: 'models',
                    label: 'Models',
                    icon: <RiBrainAi3Line className="size-4 mr-2 opacity-70" />,
                  },
                  {
                    value: 'changelog',
                    label: 'Changelog',
                    icon: <RiGitMergeLine className="size-4 mr-2 opacity-70" />,
                  },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="p-3 border-input rounded-full shadow-none data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="p-4 bg-muted/5">
            <p className="text-[10px] text-muted-foreground text-center">
              Ginger
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="p-6 h-full overflow-y-auto">
            {activeTab === 'general' && <GeneralSettings />}

            {activeTab === 'providers' && <ProviderSettings />}

            {activeTab === 'models' && (
              <ModelSettings setActiveTab={setActiveTab} />
            )}

            {activeTab === 'changelog' && <ChangelogSettings />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
