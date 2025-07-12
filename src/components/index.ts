/**
 * Reyada Homecare Platform - Component Index
 * Central export point for all production-ready components
 * Organized by category for easy access and maintenance
 */

// UI Components (from shadcn/ui)
export { Button } from './ui/button';
export { Card, CardContent, CardHeader, CardTitle } from './ui/card';
export { Badge } from './ui/badge';
export { Progress } from './ui/progress';
export { Alert, AlertDescription } from './ui/alert';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Textarea } from './ui/textarea';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
export { Checkbox } from './ui/checkbox';
export { RadioGroup, RadioGroupItem } from './ui/radio-group';
export { Switch } from './ui/switch';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
export { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
export { Calendar } from './ui/calendar';
export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
export { Separator } from './ui/separator';
export { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
export { ScrollArea } from './ui/scroll-area';

// Healthcare Components
export { PatientRegistrationForm } from './healthcare/PatientRegistrationForm';
export { ClinicalAssessmentForm } from './healthcare/ClinicalAssessmentForm';
export { DOHComplianceChecker } from './healthcare/DOHComplianceChecker';
export { PatientSafetyMonitor } from './healthcare/PatientSafetyMonitor';
export { ClinicalQualityDashboard } from './healthcare/ClinicalQualityDashboard';

// Dashboard Components
export { HealthcareDashboard } from './dashboards/HealthcareDashboard';
export { ComplianceDashboard } from './dashboards/ComplianceDashboard';
export { PerformanceDashboard } from './dashboards/PerformanceDashboard';
export { AnalyticsDashboard } from './dashboards/AnalyticsDashboard';

// Form Components
export { DynamicFormRenderer } from './forms/DynamicFormRenderer';
export { FormBuilder } from './forms/FormBuilder';
export { ValidationDisplay } from './forms/ValidationDisplay';

// Layout Components
export { MainLayout } from './layout/MainLayout';
export { Sidebar } from './layout/Sidebar';
export { Header } from './layout/Header';
export { Footer } from './layout/Footer';

// Component Categories for organized access
export const UIComponents = {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Calendar,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ScrollArea,
};

export const HealthcareComponents = {
  PatientRegistrationForm,
  ClinicalAssessmentForm,
  DOHComplianceChecker,
  PatientSafetyMonitor,
  ClinicalQualityDashboard,
};

export const DashboardComponents = {
  HealthcareDashboard,
  ComplianceDashboard,
  PerformanceDashboard,
  AnalyticsDashboard,
};

export const FormComponents = {
  DynamicFormRenderer,
  FormBuilder,
  ValidationDisplay,
};

export const LayoutComponents = {
  MainLayout,
  Sidebar,
  Header,
  Footer,
};

// Component Registry for dynamic access
export const ComponentRegistry = {
  ...UIComponents,
  ...HealthcareComponents,
  ...DashboardComponents,
  ...FormComponents,
  ...LayoutComponents,
};

// Component Health Check
export async function checkComponentHealth(): Promise<Record<string, boolean>> {
  const healthStatus: Record<string, boolean> = {};
  
  for (const [componentName, component] of Object.entries(ComponentRegistry)) {
    try {
      // Check if component is valid React component
      if (component && typeof component === 'function') {
        healthStatus[componentName] = true;
      } else {
        healthStatus[componentName] = false;
      }
    } catch (error) {
      healthStatus[componentName] = false;
    }
  }
  
  return healthStatus;
}