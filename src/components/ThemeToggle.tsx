import { LaptopMinimal, Moon, Sun } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") ?? "system";
  });

  return (
    <Tabs value={theme} className="shrink-0" orientation="vertical">
      <TabsList className="h-fit flex-col">
        <TabsTrigger
          value="system"
          className="p-1"
          onClick={() => {
            setTheme("system");
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (isDark) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
            localStorage.setItem("theme", "system");
          }}
        >
          <LaptopMinimal />
        </TabsTrigger>
        <TabsTrigger
          value="light"
          className="p-1"
          onClick={() => {
            setTheme("light");
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
          }}
        >
          <Sun />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          className="p-1"
          onClick={() => {
            setTheme("dark");
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
          }}
        >
          <Moon />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
