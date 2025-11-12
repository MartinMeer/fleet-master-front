/**
 * User alert creation form for reporting vehicle problems and issues
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { DateInput } from '../components/ui/date-input'
import { DataService, Car as CarType } from '../services/DataService'
import { AlertService, AlertPriority, AlertFormData } from '../services/AlertService'
import { ArrowLeft, AlertTriangle, Save, X } from 'lucide-react'
import { dateUtils } from '../lib/utils'

export default function UserAlert() {
  const navigate = useNavigate()
  const [cars, setCars] = useState<CarType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    carId: '',
    date: dateUtils.getCurrentRussianDate(),
    mileage: '',
    system: '',
    location: '',
    priority: '' as AlertPriority | '',
    description: ''
  })

  // Load cars on component mount
  useEffect(() => {
    const loadCars = async () => {
      try {
        setIsLoading(true)
        const carsData = await DataService.getCars()
        setCars(carsData)
      } catch (error) {
        console.error('Error loading cars:', error)
        setError('Ошибка загрузки списка автомобилей')
      } finally {
        setIsLoading(false)
      }
    }

    loadCars()
  }, [])

  const systemOptions = [
    'Двигатель',
    'Трансмиссия', 
    'Подвеска',
    'Тормозная система',
    'Рулевое управление',
    'Электрика',
    'Система охлаждения',
    'Топливная система',
    'Выхлопная система',
    'Салон',
    'Кузов',
    'Другое (указать)'
  ]

  const priorityOptions = [
    {
      value: 'critical',
      icon: '🔴',
      emoji: '🙏',
      title: 'Совсем плохо/совсем страшно',
      description: 'Критическая проблема, требующая немедленного внимания'
    },
    {
      value: 'unclear', 
      icon: '🟡',
      emoji: '🤷‍♀️',
      title: 'Непонятно',
      description: 'Проблема неясного характера, требует диагностики'
    },
    {
      value: 'can-wait',
      icon: '🔵', 
      emoji: '✍️',
      title: 'Потерпим',
      description: 'Незначительная проблема, можно отложить'
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const required = ['carId', 'date', 'system', 'priority', 'description']
    return required.every(field => formData[field as keyof typeof formData].trim() !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    const selectedCar = cars.find(c => c.id === formData.carId)
    if (!selectedCar) {
      setError('Выберите автомобиль')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const alertData: AlertFormData = {
        carId: formData.carId,
        carName: selectedCar.name,
        type: 'problem',
        priority: formData.priority as AlertPriority,
        description: formData.description,
        location: formData.system + (formData.location ? ` - ${formData.location}` : ''),
        mileage: parseInt(formData.mileage) || 0
      }

      await AlertService.createAlert(alertData)

      // Navigate to alert list with success message
      navigate('/alerts', { 
        state: { message: 'Сообщение о проблеме успешно создано!' }
      })
    } catch (error) {
      console.error('Error creating alert:', error)
      setError(error.message || 'Ошибка при создании сообщения. Попробуйте еще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCar = cars.find(c => c.id === formData.carId)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Сообщи о проблеме
              </h1>
              <p className="text-sm text-gray-600">Запишите замеченную неисправность для последующего анализа</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Автомобиль:</p>
                  <p className="font-medium">{selectedCar ? selectedCar.name : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Дата:</p>
                  <p className="font-medium">{formData.date || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Пробег:</p>
                  <p className="font-medium">{formData.mileage || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Car Selection */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="car">Выберите автомобиль *</Label>
                <Select value={formData.carId} onValueChange={(value) => handleInputChange('carId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите автомобиль..." />
                  </SelectTrigger>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.name}{car.nickname && ` "${car.nickname}"`} - {car.brand} {car.model}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Дата обнаружения *</Label>
                <DateInput
                  id="date"
                  value={formData.date}
                  onChange={(value) => handleInputChange('date', value)}
                />
              </div>

              <div>
                <Label htmlFor="mileage">Пробег на момент обнаружения (км)</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="85000"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Problem Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Где замечена неисправность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="system">Выберите систему *</Label>
                <Select value={formData.system} onValueChange={(value) => handleInputChange('system', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите систему..." />
                  </SelectTrigger>
                  <SelectContent>
                    {systemOptions.map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Укажите место неисправности</Label>
                <Input
                  id="location"
                  placeholder="Опишите конкретное место..."
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Priority Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Приоритет проблемы</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
                className="space-y-3"
              >
                {priorityOptions.map((option) => (
                  <div key={option.value} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-lg">{option.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <label htmlFor={option.value} className="cursor-pointer">
                          <p className="font-medium">{option.title}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Problem Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Описание проблемы</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">Подробное описание *</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите проблему максимально подробно..."
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 символов
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
                <X className="h-4 w-4 mr-2" />
                Не сохранять
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={!validateForm() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}