import type { ViewName } from "../../../state.ts";
import logoUrl from "../../../../assets/logo/logo.svg";
import { NavBar } from "./NavBar.tsx";

interface AppHeaderProps {
  activeView: ViewName | null;
}

export function AppHeader({ activeView }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <img
            src={logoUrl}
            alt="Project ReMotion logo"
            className="brand-logo"
          />
          <div>
            <h1>Project ReMotion</h1>
            <p className="subtitle">
              Investigate the failure of an AI-assisted rehabilitation robot.
            </p>
          </div>
        </div>
        <NavBar activeView={activeView} />
      </div>
    </header>
  );
}
