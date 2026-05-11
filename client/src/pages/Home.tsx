/*
 * Design Philosophy: Pixel Quest Forge.
 * The UI must feel like a compact handheld RPG status screen: chunky pixel panels,
 * tactile command buttons, readable mobile hierarchy, and only four functional accent colors:
 * #03AED2 progress/action, #F8DE22 reward/gold, #F45B26 warning/heat, #D12052 failure/lethal.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Award,
  BadgePercent,
  Boxes,
  CircleDollarSign,
  Clock3,
  Flame,
  FlaskConical,
  Hammer,
  History,
  PackageOpen,
  Pickaxe,
  ShieldCheck,
  ShoppingCart,
  Skull,
  Sparkles,
  Sword,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";