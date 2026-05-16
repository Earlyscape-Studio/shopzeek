// components/storefront/checkout/BillingFields.tsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export function BillingFields() {
  return (
    <div className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input
            name="firstName"
            placeholder="First name"
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input
            name="lastName"
            placeholder="Last name"
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
            required
          />
        </div>
      </div>

      {/* Company */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Company Name{" "}
          <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <Input
          name="company"
          className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
        />
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Address</label>
        <Input
          name="address"
          className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
          required
        />
      </div>

      {/* Country / State / City / Zip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Country</label>
          <Select name="country" defaultValue="ng">
            <SelectTrigger className="h-11 border-gray-200 rounded-lg focus:ring-orange-500">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ng">Nigeria</SelectItem>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">State</label>
          <Select name="state">
            <SelectTrigger className="h-11 border-gray-200 rounded-lg focus:ring-orange-500">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {nigerianStates.map((state) => (
                <SelectItem key={state} value={state.toLowerCase()}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">City</label>
          <Input
            name="city"
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Zip Code</label>
          <Input
            name="zipcode"
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
          />
        </div>
      </div>

      {/* Email / Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            name="email"
            type="email"
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <Input
            name="phone"
            type="tel"
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
            required
          />
        </div>
      </div>
    </div>
  );
}