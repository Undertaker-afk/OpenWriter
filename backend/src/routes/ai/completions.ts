import express, { Request, Response } from 'express';
import { generateTextCompletion, streamTextCompletion } from '../../utils/openrouter';

const router = express.Router();

router.post('/completions', async (req: Request, res: Response): Promise<Response | void> => {
  // Create AbortController for all requests
  const abortController: AbortController = new AbortController();
  
  // Handle client disconnect for cancelation
  req.on('close', () => {
    console.log('Client closed connection, aborting completions request');
    abortController.abort();
  });
  
  // Set up request timeout
  const requestTimeout = setTimeout(() => {
    console.log('Completions request timeout reached, aborting');
    abortController.abort();
  }, 300000); // 5 minute timeout for non-streaming requests
  
  try {
    const { 
      model, 
      prompt,
      temperature, 
      max_tokens, 
      stream,
      top_p,
      top_k,
      frequency_penalty,
      presence_penalty,
      repetition_penalty,
      seed,
      stop,
      logprobs,
      top_logprobs,
      logit_bias,
      transforms,
      models,
      route,
      provider,
      max_price
    } = req.body;
    
    // Validate required fields
    if (!model) {
      return res.status(400).json({ error: 'Model is required', type: 'bad_request' });
    }
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required', type: 'bad_request' });
    }
    
    // Handle streaming requests
    if (stream) {
      // Set proper headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Setup keep-alive interval
      let lastActivity = Date.now();
      const keepAliveInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastActivity > 15000 && !res.writableEnded) { // 15 seconds without activity
          res.write(': OPENROUTER PROCESSING\n\n');
          lastActivity = now;
        }
      }, 15000);
      
      try {
        // Stream the text completion
        await streamTextCompletion(
          {
            model,
            prompt,
            temperature,
            max_tokens,
            stream: true,
            top_p,
            top_k,
            frequency_penalty,
            presence_penalty,
            repetition_penalty,
            seed,
            stop,
            logprobs,
            top_logprobs,
            logit_bias,
            transforms,
            models,
            route,
            provider,
            max_price
          },
          res, // Pass response object for streaming
          abortController.signal
        );
        
        // Streaming is handled by the function, cleanup on completion
        clearInterval(keepAliveInterval);
        clearTimeout(requestTimeout);
      } catch (error: unknown) {
        // Cleanup resources
        clearInterval(keepAliveInterval);
        clearTimeout(requestTimeout);
        
        // Only send error if not aborted and connection is still open
        if (!abortController.signal.aborted && !res.writableEnded) {
          console.error('Streaming completion failed:', error);
          
          // Handle enhanced errors
          if ((error as any).type || (error as any).code) {
            const statusCode = (error as any).code || (error as any).status || 500;
            res.write(`data: ${JSON.stringify({ 
              error: { 
                message: (error as any).message,
                type: (error as any).type || 'unknown' 
              } 
            })}\n\n`);
          } else {
            res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
          }
          
          res.end();
        }
      }
      
      return; // End handler for streaming requests
    }
    
    // Handle non-streaming requests
    try {
      const result = await generateTextCompletion(
        {
          model,
          prompt,
          temperature,
          max_tokens,
          stream: false,
          top_p,
          top_k,
          frequency_penalty,
          presence_penalty,
          repetition_penalty,
          seed,
          stop,
          logprobs,
          top_logprobs,
          logit_bias,
          transforms,
          models,
          route,
          provider,
          max_price
        },
        abortController.signal
      );
      
      // Clear timeout as request completed successfully
      clearTimeout(requestTimeout);
      
      if (!res.writableEnded) {
        return res.json(result);
      }
    } catch (error: unknown) {
      // Clear timeout
      clearTimeout(requestTimeout);
      
      // Don't respond if the request was aborted or already ended
      if (abortController.signal.aborted || res.writableEnded) {
        return;
      }
      
      console.error('Error generating text completion:', error);
      
      // Handle enhanced errors
      if ((error as any).type || (error as any).code) {
        const statusCode = (error as any).code || (error as any).status || 500;
        const errorType = (error as any).type || 'unknown';
        
        const errorResponse: any = { 
          error: (error as any).message,
          type: errorType
        };
        
        // Add additional details for moderation errors
        if (errorType === 'moderation' && (error as any).reasons) {
          errorResponse.reasons = (error as any).reasons;
          errorResponse.flagged_input = (error as any).flagged_input;
          errorResponse.provider = (error as any).provider;
        }
        
        // Add provider details for provider errors
        if (errorType === 'provider_error' && (error as any).provider) {
          errorResponse.provider = (error as any).provider;
          if ((error as any).raw_error) {
            errorResponse.raw_provider_error = (error as any).raw_error;
          }
        }
        
        return res.status(statusCode).json(errorResponse);
      }
      
      // Generic error response
      return res.status(500).json({ 
        error: (error as any).message || 'Failed to generate text completion',
        type: 'server_error'
      });
    }
  } catch (error: unknown) {
    // Clear timeout in case of error
    clearTimeout(requestTimeout);
    
    // Don't respond if the request was aborted or already ended
    if (abortController.signal.aborted || res.writableEnded) {
      return;
    }
    
    console.error('Error in completions route:', error);
    return res.status(500).json({ 
      error: 'Internal server error processing completions request',
      type: 'server_error'
    });
  } finally {
    // Make sure timeout is cleared
    clearTimeout(requestTimeout);
  }
});

export default router;
