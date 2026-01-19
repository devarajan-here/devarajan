import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitMessage = useMutation(api.messages.submit);

  const CONTACT_EMAIL = 'devarajanpm79@gmail.com';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const message = String(formData.get('message') || '').trim();

      await submitMessage({ name, email, message });

      // Open default email client with prefilled subject and body
      const subject = encodeURIComponent(`New Portfolio Message from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      );
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      window.location.href = mailto;

      toast.success('Message saved & email composer opened!', {
        description: "Your default mail app should appear with the draft ready to send.",
      });

      form.reset();
    } catch (err: any) {
      const msg = err?.message || 'Failed to send your message. Please try again.';
      toast.error('Error', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto"
    >
      <div>
        <Input
          type="text"
          name="name"
          placeholder="Your Name"
          required
          className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
        />
      </div>
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Your Email"
          required
          className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
        />
      </div>
      <div>
        <Textarea
          name="message"
          placeholder="Your Message"
          rows={5}
          required
          className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-white text-black hover:bg-white/90"
      >
        {isSubmitting ? (
          'Sending...'
        ) : (
          <>
            Send Message
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </motion.form>
  );
}