import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LogIn, 
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  User,
  Building
} from 'lucide-react';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    emiratesId: '',
    facility: ''
  });

  const securityFeatures = [
    { name: 'Multi-Factor Authentication', status: 'Active', icon: Smartphone },
    { name: 'Role-Based Access Control', status: 'Active', icon: User },
    { name: 'AES-256 Encryption', status: 'Active', icon: Lock },
    { name: 'DOH Security Standards', status: 'Compliant', icon: Shield }
  ];

  const handleInputChange = (field, value) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Login Form */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="h-10 w-10 text-blue-600" />
              <div>
                <CardTitle className="text-2xl text-blue-800">Reyada Homecare</CardTitle>
                <CardDescription>Secure Healthcare Platform Access</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={loginData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Emirates ID Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Emirates ID</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="784-YYYY-XXXXXXX-X"
                  value={loginData.emiratesId}
                  onChange={(e) => handleInputChange('emiratesId', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Facility Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Healthcare Facility</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={loginData.facility}
                  onChange={(e) => handleInputChange('facility', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Facility</option>
                  <option value="dubai-healthcare-city">Dubai Healthcare City</option>
                  <option value="abu-dhabi-medical">Abu Dhabi Medical Center</option>
                  <option value="sharjah-homecare">Sharjah Homecare Unit</option>
                  <option value="ajman-clinic">Ajman Healthcare Clinic</option>
                </select>
              </div>
            </div>

            {/* Login Button */}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12">
              <LogIn className="h-4 w-4 mr-2" />
              Secure Login
            </Button>

            {/* Additional Options */}
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600">
                <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
              </div>
              <div className="text-sm text-gray-600">
                Need access? <a href="#" className="text-blue-600 hover:underline">Contact Administrator</a>
              </div>
            </div>

            {/* MFA Notice */}
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-yellow-600" />
                <div className="text-sm text-yellow-800">
                  <strong>Multi-Factor Authentication Required</strong>
                  <div className="text-xs text-yellow-600">
                    You will receive a verification code on your registered device
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="space-y-6">
          
          {/* Platform Info */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Shield className="h-5 w-5" />
                <span>Secure Healthcare Platform</span>
              </CardTitle>
              <CardDescription>
                DOH-compliant digital transformation for UAE healthcare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <strong>Platform Features:</strong>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Patient Management with Emirates ID Integration</li>
                  <li>• 16 Mobile-Optimized Clinical Forms</li>
                  <li>• Real-time DOH Compliance Monitoring</li>
                  <li>• Electronic Signatures & Documentation</li>
                  <li>• Offline Capabilities & Voice-to-Text</li>
                  <li>• Camera Integration for Wound Documentation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Security Features</span>
              </CardTitle>
              <CardDescription>
                Enterprise-grade security for healthcare data protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <feature.icon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{feature.name}</span>
                    </div>
                    <Badge className={
                      feature.status === 'Active' || feature.status === 'Compliant' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }>
                      {feature.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Notice */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800">DOH Compliance Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-purple-700 space-y-2">
                <p>
                  This platform complies with UAE Ministry of Health and Prevention 
                  standards for healthcare data security and patient privacy.
                </p>
                <p>
                  All access is logged and monitored for compliance purposes.
                  Unauthorized access is strictly prohibited.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <div><strong>Help Desk:</strong> +971-4-XXX-XXXX</div>
                <div><strong>Email:</strong> support@reyadahomecare.ae</div>
                <div><strong>Hours:</strong> 24/7 Healthcare Support</div>
                <div><strong>Emergency:</strong> +971-50-XXX-XXXX</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}