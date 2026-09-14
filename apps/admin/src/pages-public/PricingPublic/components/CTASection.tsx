import { Button } from '@/components/ui/Button'

interface CTASectionProps {
  onStartQuiz: () => void
  onContactSales: () => void
}

const CTASection = ({
  onStartQuiz,
  onContactSales,
}: CTASectionProps): JSX.Element => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of education providers who trust Flowclass to manage
          their institutions
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            onClick={onStartQuiz}
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Start Quiz
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold"
            onClick={onContactSales}
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CTASection
